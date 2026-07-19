"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Link as LinkIcon, Camera, Image as ImageIcon, 
  FileText, X, Search, RotateCw, Settings, Check, 
  Trash2, Play, Volume2, Video, Loader2, ArrowRight
} from 'lucide-react';
import { API_URL } from '@/config';
import { apiFetch } from '@/lib/apiClient';

/**
 * Componente Universal de Gestión de Archivos para Club Jorge Newbery Digital
 * 
 * Props:
 *  - value: string (URL del archivo seleccionado)
 *  - onChange: (url: string) => void (callback cuando cambia la selección)
 *  - category: string (socios, sponsors, galeria, noticias, etc.)
 *  - allowedTypes: Array<'image' | 'video' | 'audio' | 'document'> (default: todos)
 *  - multiple: boolean (por ahora un solo archivo, expandible si se requiere)
 */
export default function MediaUploadUniversal({ 
  value, 
  onChange, 
  category = 'documentos', 
  allowedTypes = ['image', 'video', 'audio', 'document'],
  compact = false
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // upload, url, camera, library
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados de carga de archivos (Upload)
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Porcentaje
  const xhrRef = useRef(null); // Para poder cancelar la carga

  // Estados de Pegar URL
  const [inputUrl, setInputUrl] = useState('');
  const [urlPreview, setUrlPreview] = useState(null);

  // Estados de Cámara
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const videoRef = useRef(null);

  // Estados de Biblioteca
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [libCategoryFilter, setLibCategoryFilter] = useState('ALL');
  const [libTypeFilter, setLibTypeFilter] = useState('ALL');
  const [libSortBy, setLibSortBy] = useState('createdAt');

  // Estados del Editor (Rotar, redimensionar, renombrar)
  const [editFile, setEditFile] = useState(null); // { blob, name, previewUrl, width, height, type, size }
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newName, setNewName] = useState('');

  // Validar URL simple
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Buscar archivos en biblioteca
  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(
        `/api/media?library=true&category=${libCategoryFilter}&type=${libTypeFilter}&search=${searchQuery}&sortBy=${libSortBy}`
      );
      if (res.ok) {
        setLibraryFiles(await res.json());
      } else {
        console.error('[MediaUpload] Error al cargar biblioteca:', res.status);
      }
    } catch (e) {
      console.error('[MediaUpload] Error al cargar biblioteca:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalOpen && activeTab === 'library') {
      fetchLibrary();
    }
  }, [modalOpen, activeTab, libCategoryFilter, libTypeFilter, libSortBy]);

  // Manejar búsqueda con debounce manual
  useEffect(() => {
    if (modalOpen && activeTab === 'library') {
      const delayDebounce = setTimeout(() => {
        fetchLibrary();
      }, 500);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchQuery]);

  // Destruir cámara al cambiar pestaña o cerrar modal
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsRecording(false);
  };

  useEffect(() => {
    if (activeTab !== 'camera' || !modalOpen) {
      stopCamera();
    }
  }, [activeTab, modalOpen]);

  // --- LÓGICA DRAG & DROP & PC UPLOAD ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Validaciones y carga en estado de edición
  const processSelectedFile = (file) => {
    setErrorMsg('');
    setSuccessMsg('');

    // Validar tipo de archivo
    const fileMime = file.type;
    const isImage = fileMime.startsWith('image/');
    const isVideo = fileMime.startsWith('video/');
    const isAudio = fileMime.startsWith('audio/');
    const isDoc = fileMime === 'application/pdf' || 
                 fileMime.includes('word') || 
                 fileMime.includes('excel') || 
                 fileMime.includes('officedocument') ||
                 fileMime.includes('ms-excel');

    let resolvedType = '';
    if (isImage) resolvedType = 'image';
    else if (isVideo) resolvedType = 'video';
    else if (isAudio) resolvedType = 'audio';
    else if (isDoc) resolvedType = 'document';

    if (!resolvedType || !allowedTypes.includes(resolvedType)) {
      setErrorMsg(`Formato de archivo no permitido. Tipos aceptados: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validar tamaño máximo (100MB)
    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSize) {
      setErrorMsg('El archivo es demasiado grande. El límite máximo es de 100MB.');
      return;
    }

    // Crear preview y cargar en el editor
    const previewUrl = URL.createObjectURL(file);
    const newFileState = {
      blob: file,
      name: file.name,
      previewUrl,
      type: fileMime,
      size: file.size,
      width: 0,
      height: 0
    };

    if (isImage) {
      const img = new Image();
      img.onload = () => {
        newFileState.width = img.width;
        newFileState.height = img.height;
        setNewWidth(img.width.toString());
        setNewHeight(img.height.toString());
        setEditFile(newFileState);
      };
      img.src = previewUrl;
    } else {
      setEditFile(newFileState);
    }
    setNewName(file.name);
    setRotation(0);
  };

  // --- LÓGICA DE EDICIÓN Y ROTACIÓN ---
  const rotateImage = () => {
    if (!editFile) return;
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
  };

  // Guardar archivo editado (y aplicar rotación o redimensión real vía Canvas)
  const saveEditedFileAndUpload = async () => {
    if (!editFile) return;
    setLoading(true);
    setErrorMsg('');

    let finalBlob = editFile.blob;

    // Si hubo rotación o cambio de dimensiones en imagen, aplicarla en canvas real
    if (editFile.type.startsWith('image/') && (rotation !== 0 || newWidth || newHeight)) {
      try {
        finalBlob = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const targetWidth = parseInt(newWidth) || img.width;
            const targetHeight = parseInt(newHeight) || img.height;

            // Determinar dimensiones del canvas basadas en rotación
            if (rotation === 90 || rotation === 270) {
              canvas.width = targetHeight;
              canvas.height = targetWidth;
            } else {
              canvas.width = targetWidth;
              canvas.height = targetHeight;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('No se pudo obtener contexto 2D'));

            // Aplicar rotación
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);

            canvas.toBlob(blob => {
              if (blob) resolve(blob);
              else reject(new Error('Error al convertir canvas a Blob'));
            }, editFile.type);
          };
          img.onerror = () => reject(new Error('Error al cargar imagen en canvas'));
          img.src = editFile.previewUrl;
        });
      } catch (err) {
        console.error('Error al editar imagen en canvas:', err);
      }
    }

    // Subir el archivo real al backend
    uploadFile(finalBlob, newName);
  };

  const uploadFile = (blob, filenameToUse) => {
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    const formData = new FormData();
    formData.append('file', blob, filenameToUse);
    formData.append('category', category);
    if (newWidth) formData.append('width', newWidth);
    if (newHeight) formData.append('height', newHeight);

    setUploadProgress(1);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(pct);
      }
    });

    xhr.addEventListener('load', () => {
      setLoading(false);
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const resData = JSON.parse(xhr.responseText);
          setSuccessMsg('¡Archivo subido y guardado exitosamente!');
          onChange(resData.url);
          setTimeout(() => {
            setModalOpen(false);
            setEditFile(null);
            setUploadProgress(0);
          }, 1500);
        } catch {
          setErrorMsg('Error al interpretar respuesta del servidor.');
        }
      } else {
        try {
          const resErr = JSON.parse(xhr.responseText);
          setErrorMsg(resErr.error || 'Falla al guardar archivo.');
        } catch {
          setErrorMsg(`Error del servidor (${xhr.status})`);
        }
      }
    });

    xhr.addEventListener('error', () => {
      setLoading(false);
      setErrorMsg('Error de red al intentar subir el archivo.');
    });

    xhr.open('POST', `/api/media/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setLoading(false);
      setUploadProgress(0);
      setErrorMsg('Carga de archivo cancelada por el usuario.');
    }
  };

  // --- LÓGICA DE CÁMARA EN VIVO ---
  const startCamera = async () => {
    setErrorMsg('');
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(userStream);
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
    } catch (e) {
      console.error('Error al encender cámara:', e);
      setErrorMsg('No se pudo acceder a la cámara o micrófono. Verifica tus permisos.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (blob) {
        const photoFile = new File([blob], `camara-${Date.now()}.jpg`, { type: 'image/jpeg' });
        processSelectedFile(photoFile);
      }
    }, 'image/jpeg');
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      stopCamera();
    } else {
      if (!stream) return;
      const chunks = [];
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        recorder = new MediaRecorder(stream);
      }
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        const videoFile = new File([videoBlob], `grabacion-${Date.now()}.webm`, { type: 'video/webm' });
        processSelectedFile(videoFile);
      };

      setRecordedChunks([]);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    }
  };

  // --- LÓGICA DE PEGAR URL Y PREVISUALIZAR ---
  const handleUrlChange = (e) => {
    const urlStr = e.target.value;
    setInputUrl(urlStr);
    setErrorMsg('');

    if (!isValidUrl(urlStr)) {
      setUrlPreview(null);
      return;
    }

    let type = 'web';
    let isYoutube = urlStr.includes('youtube.com') || urlStr.includes('youtu.be');
    let isVimeo = urlStr.includes('vimeo.com');
    let isDrive = urlStr.includes('drive.google.com');

    if (isYoutube) type = 'youtube';
    else if (isVimeo) type = 'vimeo';
    else if (isDrive) type = 'drive';
    else if (urlStr.match(/\.(jpeg|jpg|gif|png|webp|svg)/i)) type = 'image';
    else if (urlStr.match(/\.(mp4|webm|mov)/i)) type = 'video';
    else if (urlStr.match(/\.(mp3|wav)/i)) type = 'audio';
    else if (urlStr.match(/\.pdf/i)) type = 'pdf';

    setUrlPreview({ url: urlStr, type });
  };

  // Confirmar enlace e intentar descargar
  const handleSaveUrl = async () => {
    if (!urlPreview) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
      
      const res = await fetch(`/api/media/upload-url`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: urlPreview.url, category })
      });

      if (res.ok) {
        const fileRecord = await res.json();
        setSuccessMsg('Enlace y archivo remoto guardado exitosamente.');
        onChange(fileRecord.url);
        setTimeout(() => {
          setModalOpen(false);
          setInputUrl('');
          setUrlPreview(null);
        }, 1500);
      } else {
        onChange(urlPreview.url);
        setSuccessMsg('URL asociada directamente (no se pudo descargar localmente).');
        setTimeout(() => {
          setModalOpen(false);
          setInputUrl('');
          setUrlPreview(null);
        }, 1500);
      }
    } catch {
      onChange(urlPreview.url);
      setSuccessMsg('URL asociada.');
      setTimeout(() => {
        setModalOpen(false);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE BIBLIOTECA ---
  const handleSelectFromLibrary = (file) => {
    onChange(file.url);
    setModalOpen(false);
  };

  const handleDeleteFromLibrary = async (fileId, e) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar permanentemente este archivo del disco y base de datos?')) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
      const res = await fetch(`/api/media/${fileId}?type=file`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchLibrary();
      }
    } catch (e) {
      console.error('Error al eliminar archivo:', e);
    }
  };

  return (
    <div className="w-full">
      {/* PREVIEW CONTAINER EN FORMULARIO */}
      {value ? (
        compact ? (
          <div className="border border-gray-200 rounded-xl p-1.5 bg-gray-50 flex items-center justify-between gap-3 animate-fade-in text-jn-black">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-gray-150 flex items-center justify-center flex-shrink-0">
                {value.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || value.includes('socios') || value.includes('sponsors') || value.includes('noticias') ? (
                  <img src={value.startsWith('http') ? value : `${API_URL}${value}`} alt="Vista Previa" className="w-full h-full object-contain" />
                ) : value.match(/\.(mp4|webm|mov)/i) || value.includes('videos') ? (
                  <Video className="text-red-650" size={16} />
                ) : (
                  <FileText className="text-jn-black" size={16} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">Asociado</p>
                <p className="text-[10px] font-semibold truncate font-mono text-jn-black max-w-[120px]">{value.split('/').pop()}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button 
                type="button" 
                onClick={() => setModalOpen(true)}
                className="bg-jn-black hover:bg-gray-800 text-white font-black uppercase text-[8px] px-2 py-1.5 rounded transition-colors"
              >
                Cambiar
              </button>
              <button 
                type="button" 
                onClick={() => onChange('')}
                className="bg-white border hover:bg-gray-100 text-red-600 font-black uppercase text-[8px] px-2 py-1.5 rounded transition-colors"
              >
                Quitar
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-gray-250 rounded-2xl p-4 bg-gray-50 flex flex-col md:flex-row items-center gap-4 relative animate-fade-in text-jn-black">
            {/* Miniatura inteligente */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-150 flex items-center justify-center flex-shrink-0 shadow-sm">
              {value.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || value.includes('socios') || value.includes('sponsors') || value.includes('noticias') ? (
                <img src={value.startsWith('http') ? value : `${API_URL}${value}`} alt="Vista Previa" className="w-full h-full object-contain" />
              ) : value.match(/\.(mp4|webm|mov)/i) || value.includes('videos') ? (
                <Video className="text-red-600" size={32} />
              ) : value.match(/\.(mp3|wav)/i) ? (
                <Volume2 className="text-blue-600" size={32} />
              ) : (
                <FileText className="text-jn-black" size={32} />
              )}
            </div>

            <div className="flex-1 min-w-0 text-center md:text-left space-y-1">
              <p className="text-xs font-black text-jn-black truncate uppercase tracking-wide">Archivo Asociado</p>
              <p className="text-[10px] text-gray-500 font-mono break-all font-semibold select-all">{value}</p>
            </div>

            <div className="flex gap-2 w-full md:w-auto justify-center">
              <button 
                type="button" 
                onClick={() => setModalOpen(true)}
                className="bg-jn-black hover:bg-gray-800 text-white font-black uppercase text-[10px] px-3.5 py-2 rounded-lg transition-colors"
              >
                Cambiar
              </button>
              <button 
                type="button" 
                onClick={() => onChange('')}
                className="bg-white border hover:bg-gray-100 text-red-650 font-black uppercase text-[10px] px-3.5 py-2 rounded-lg transition-colors"
              >
                Quitar
              </button>
            </div>
          </div>
        )
      ) : (
        /* CAJA RECEPTORA DESCONECTADA */
        compact ? (
          <button 
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full border border-dashed border-gray-300 hover:border-jn-red rounded-lg p-2.5 text-center cursor-pointer bg-white hover:bg-red-50/10 transition-all text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 text-gray-600"
          >
            <Upload size={12} className="text-gray-400" />
            <span>Subir o Buscar Foto</span>
          </button>
        ) : (
          <div 
            onClick={() => setModalOpen(true)}
            className="border-2 border-dashed border-gray-300 hover:border-jn-red rounded-2xl p-6 text-center cursor-pointer bg-white hover:bg-red-50/20 transition-all select-none group"
          >
            <div className="w-12 h-12 bg-gray-100 group-hover:bg-red-100/50 text-gray-500 group-hover:text-jn-red rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
              <Upload size={20} />
            </div>
            <p className="text-xs font-black uppercase text-jn-black tracking-wide">Cargar Archivo / Multimedia</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1.5 mb-6">Haz clic para subir de PC, pegar URL o usar Biblioteca</p>
          </div>
        )
      )}

      {/* MODAL DIALOG UNIVERSAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in text-jn-black">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
            {/* Cabecera del modal */}
            <div className="bg-jn-black text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 bg-jn-red rounded-full"></div>
                <h3 className="font-black text-base uppercase tracking-wider">Gestor Multimedia Universal</h3>
              </div>
              <button 
                type="button"
                onClick={() => { setModalOpen(false); setEditFile(null); stopCamera(); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Pestañas de navegación */}
            <div className="bg-gray-100 border-b flex overflow-x-auto text-[10px] font-black uppercase tracking-wider">
              <button 
                type="button"
                onClick={() => { setActiveTab('upload'); setEditFile(null); }}
                className={`px-5 py-3.5 border-r transition-all flex items-center gap-1.5 ${activeTab === 'upload' ? 'bg-white text-jn-red border-b-2 border-b-jn-red' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Upload size={14} /> Subir de PC
              </button>
              <button 
                type="button"
                onClick={() => { setActiveTab('url'); setEditFile(null); }}
                className={`px-5 py-3.5 border-r transition-all flex items-center gap-1.5 ${activeTab === 'url' ? 'bg-white text-jn-red border-b-2 border-b-jn-red' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <LinkIcon size={14} /> Pegar URL
              </button>
              <button 
                type="button"
                onClick={() => { setActiveTab('camera'); startCamera(); setEditFile(null); }}
                className={`px-5 py-3.5 border-r transition-all flex items-center gap-1.5 ${activeTab === 'camera' ? 'bg-white text-jn-red border-b-2 border-b-jn-red' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Camera size={14} /> Cámara en vivo
              </button>
              <button 
                type="button"
                onClick={() => { setActiveTab('library'); setEditFile(null); }}
                className={`px-5 py-3.5 border-r transition-all flex items-center gap-1.5 ${activeTab === 'library' ? 'bg-white text-jn-red border-b-2 border-b-jn-red' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <ImageIcon size={14} /> Biblioteca
              </button>
            </div>

            {/* CUERPO CENTRAL DE ACCIÓN */}
            <div className="flex-1 overflow-y-auto p-6 relative bg-gray-50 flex flex-col justify-center">
              
              {/* Alertas de error / éxito */}
              {errorMsg && (
                <div className="absolute top-4 left-6 right-6 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold z-10 animate-fade-in">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="absolute top-4 left-6 right-6 bg-green-50 border border-green-200 text-green-700 p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold z-10 animate-fade-in">
                  <span>🎉 {successMsg}</span>
                </div>
              )}

              {/* EDITOR VIEW (Superpuesto en cualquier pestaña si se selecciona un archivo local) */}
              {editFile ? (
                <div className="w-full max-w-xl mx-auto space-y-5 animate-fade-in">
                  <h4 className="font-black text-sm uppercase text-jn-black border-b pb-2 flex justify-between">
                    <span>Editar y Validar Archivo</span>
                    <button type="button" onClick={() => setEditFile(null)} className="text-red-500 hover:underline text-[10px]">Cambiar Archivo</button>
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-5 items-center">
                    {/* Preview con Rotación */}
                    <div className="bg-white border rounded-2xl p-4 aspect-square flex items-center justify-center overflow-hidden relative group">
                      {editFile.type.startsWith('image/') ? (
                        <img 
                          src={editFile.previewUrl} 
                          style={{ transform: `rotate(${rotation}deg)` }}
                          className="max-w-full max-h-full object-contain transition-transform" 
                          alt="preview"
                        />
                      ) : editFile.type.startsWith('video/') ? (
                        <video src={editFile.previewUrl} controls className="max-w-full max-h-full" />
                      ) : (
                        <FileText size={64} className="text-gray-300" />
                      )}
                    </div>

                    {/* Metadatos y Formulario de Edición */}
                    <div className="space-y-3.5 text-xs text-gray-500 font-bold uppercase">
                      <div>
                        <p className="text-[10px] text-gray-400 font-black">Información de Archivo</p>
                        <p className="text-jn-black text-sm font-black truncate mt-1">{editFile.name}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Peso: {(editFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        {editFile.width > 0 && <p className="text-[10px] text-gray-400">Resolución: {editFile.width}x{editFile.height} px</p>}
                      </div>

                      {/* Renombrar */}
                      <div>
                        <label className="mb-1 block text-[10px] text-gray-400 font-black">Nuevo Nombre</label>
                        <input 
                          type="text" 
                          value={newName} 
                          onChange={e => setNewName(e.target.value)} 
                          className="w-full p-2.5 border rounded-xl text-jn-black"
                        />
                      </div>

                      {/* Redimensionar (sólo imágenes) */}
                      {editFile.type.startsWith('image/') && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-[10px] text-gray-400 font-black">Ancho (px)</label>
                            <input 
                              type="number" 
                              value={newWidth} 
                              onChange={e => setNewWidth(e.target.value)} 
                              className="w-full p-2.5 border rounded-xl text-jn-black"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] text-gray-400 font-black">Alto (px)</label>
                            <input 
                              type="number" 
                              value={newHeight} 
                              onChange={e => setNewHeight(e.target.value)} 
                              className="w-full p-2.5 border rounded-xl text-jn-black"
                            />
                          </div>
                        </div>
                      )}

                      {/* Controles del Editor */}
                      <div className="flex gap-2 pt-2">
                        {editFile.type.startsWith('image/') && (
                          <button 
                            type="button" 
                            onClick={rotateImage}
                            className="bg-gray-100 hover:bg-gray-200 text-jn-black p-3 rounded-xl border flex items-center justify-center gap-1.5 w-full font-black uppercase text-[10px]"
                          >
                            <RotateCw size={14} /> Rotar 90°
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progreso de Carga o Botón Confirmar */}
                  {uploadProgress > 0 ? (
                    <div className="bg-gray-100 border p-4 rounded-xl space-y-2 text-jn-black">
                      <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase">
                        <span>Subiendo archivo al servidor...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-jn-red h-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <button 
                        type="button" 
                        onClick={cancelUpload}
                        className="text-red-600 font-black text-[9px] uppercase tracking-wider hover:underline"
                      >
                        Cancelar Carga
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={saveEditedFileAndUpload}
                      disabled={loading}
                      className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-4 rounded-xl transition-all shadow-lg shadow-jn-red/35 flex items-center justify-center gap-1.5 text-xs tracking-wider"
                    >
                      {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                      Guardar y Subir Archivo
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* TAB 1: UPLOAD (Local drag & drop) */}
                  {activeTab === 'upload' && (
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-3xl p-12 max-w-xl mx-auto w-full text-center transition-all ${dragActive ? 'border-jn-red bg-red-50/20' : 'border-gray-300 bg-white'}`}
                    >
                      <Upload className={`mx-auto mb-4 ${dragActive ? 'text-jn-red animate-bounce' : 'text-gray-400'}`} size={44} />
                      <h4 className="font-black text-sm uppercase text-jn-black tracking-wide">Arrastra tu archivo aquí</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1.5 mb-6">Formatos soportados: imágenes, videos, audios y documentos</p>
                      
                      <input 
                        type="file" 
                        id="universal-file-picker" 
                        className="hidden" 
                        onChange={handleFileSelect}
                        accept={allowedTypes.map(t => t === 'document' ? '.pdf,.doc,.docx,.xls,.xlsx' : `${t}/*`).join(',')}
                      />
                      <label 
                        htmlFor="universal-file-picker"
                        className="bg-jn-black hover:bg-gray-800 text-white font-black uppercase text-xs px-6 py-3.5 rounded-xl cursor-pointer shadow transition-all tracking-wider inline-flex items-center gap-2"
                      >
                        📁 Seleccionar archivo desde la PC
                      </label>
                    </div>
                  )}

                  {/* TAB 2: PEGAR URL */}
                  {activeTab === 'url' && (
                    <div className="max-w-xl mx-auto w-full space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wide">Dirección URL del archivo</label>
                        <input 
                          type="text" 
                          value={inputUrl} 
                          onChange={handleUrlChange}
                          placeholder="https://example.com/imagen.jpg" 
                          className="w-full p-3.5 border rounded-2xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                      </div>

                      {/* Vista previa automática de URL */}
                      {urlPreview && (
                        <div className="bg-white border rounded-2xl p-4 space-y-3 shadow-sm">
                          <p className="text-[10px] font-black text-gray-400 uppercase">Vista previa en vivo</p>
                          <div className="aspect-video bg-gray-50 border rounded-xl flex items-center justify-center overflow-hidden">
                            {urlPreview.type === 'image' ? (
                              <img src={urlPreview.url} className="max-w-full max-h-full object-contain" alt="preview" />
                            ) : urlPreview.type === 'video' ? (
                              <video src={urlPreview.url} controls className="max-w-full max-h-full" />
                            ) : urlPreview.type === 'youtube' ? (
                              <iframe 
                                title="YouTube" 
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${urlPreview.url.split('v=')[1]?.split('&')[0] || urlPreview.url.split('/').pop()}`}
                                frameBorder="0"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <div className="text-center p-4">
                                <FileText size={48} className="text-gray-400 mx-auto mb-2" />
                                <span className="text-[10px] text-gray-400 font-bold uppercase break-all">{urlPreview.url}</span>
                              </div>
                            )}
                          </div>
                          
                          <button 
                            type="button"
                            onClick={handleSaveUrl}
                            disabled={loading}
                            className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs tracking-wider transition-colors flex items-center justify-center gap-1.5"
                          >
                            {loading && <Loader2 className="animate-spin" size={14} />}
                            Vincular Enlace
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: CÁMARA */}
                  {activeTab === 'camera' && (
                    <div className="max-w-md mx-auto w-full space-y-5 text-center">
                      <div className="bg-black aspect-video rounded-3xl overflow-hidden border border-gray-800 flex items-center justify-center relative">
                        {!stream && (
                          <div className="text-gray-500 uppercase font-black text-[10px] tracking-widest animate-pulse">
                            Esperando conexión...
                          </div>
                        )}
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      </div>

                      {stream ? (
                        <div className="flex justify-center gap-3">
                          {allowedTypes.includes('image') && (
                            <button 
                              type="button" 
                              onClick={capturePhoto}
                              className="bg-jn-black hover:bg-gray-800 text-white font-black uppercase text-[10px] px-5 py-3 rounded-xl tracking-wider transition-colors"
                            >
                              📸 Capturar Foto
                            </button>
                          )}
                          {allowedTypes.includes('video') && (
                            <button 
                              type="button" 
                              onClick={toggleRecording}
                              className={`${isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-jn-red hover:bg-red-700'} text-white font-black uppercase text-[10px] px-5 py-3 rounded-xl tracking-wider transition-colors`}
                            >
                              🎥 {isRecording ? 'Detener Grabación' : 'Grabar Video'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <button 
                          type="button" 
                          onClick={startCamera}
                          className="bg-jn-black hover:bg-gray-800 text-white font-black uppercase text-[10px] px-6 py-3.5 rounded-xl tracking-wider transition-colors inline-flex items-center gap-1.5"
                        >
                          <Camera size={14} /> Encender Cámara
                        </button>
                      )}
                    </div>
                  )}

                  {/* TAB 4: BIBLIOTECA MULTIMEDIA */}
                  {activeTab === 'library' && (
                    <div className="h-full flex flex-col space-y-4">
                      {/* Filtros de búsqueda */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border shadow-sm text-xs uppercase font-bold text-gray-500">
                        <div className="relative text-jn-black">
                          <Search className="absolute left-3 top-3.5 text-gray-400" size={14} />
                          <input 
                            type="text" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nombre..." 
                            className="w-full p-2.5 pl-9 border rounded-xl font-medium text-jn-black placeholder:text-gray-400 text-xs"
                          />
                        </div>

                        <div>
                          <select 
                            value={libCategoryFilter}
                            onChange={e => setLibCategoryFilter(e.target.value)}
                            className="w-full p-2.5 border rounded-xl bg-white text-jn-black text-xs font-bold uppercase"
                          >
                            <option value="ALL">Todas las carpetas</option>
                            <option value="socios">socios/</option>
                            <option value="sponsors">sponsors/</option>
                            <option value="marketing">marketing/</option>
                            <option value="banners">banners/</option>
                            <option value="campañas">campañas/</option>
                            <option value="galeria">galeria/</option>
                            <option value="noticias">noticias/</option>
                            <option value="documentos">documentos/</option>
                            <option value="videos">videos/</option>
                            <option value="newbery-tv">newbery-tv/</option>
                            <option value="reservas">reservas/</option>
                            <option value="multimedia">multimedia/</option>
                          </select>
                        </div>

                        <div>
                          <select 
                            value={libTypeFilter}
                            onChange={e => setLibTypeFilter(e.target.value)}
                            className="w-full p-2.5 border rounded-xl bg-white text-jn-black text-xs font-bold uppercase"
                          >
                            <option value="ALL">Todos los formatos</option>
                            <option value="image">Imágenes</option>
                            <option value="video">Videos</option>
                            <option value="audio">Audios</option>
                            <option value="application">Documentos</option>
                          </select>
                        </div>

                        <div>
                          <select 
                            value={libSortBy}
                            onChange={e => setLibSortBy(e.target.value)}
                            className="w-full p-2.5 border rounded-xl bg-white text-jn-black text-xs font-bold uppercase"
                          >
                            <option value="createdAt">Más Recientes</option>
                            <option value="size">Más Pesados</option>
                            <option value="name">Alfabético</option>
                          </select>
                        </div>
                      </div>

                      {/* Lista de archivos en grid */}
                      <div className="flex-1 min-h-[300px] overflow-y-auto bg-white border rounded-3xl p-5 shadow-inner">
                        {loading ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="animate-spin text-jn-red" size={32} />
                          </div>
                        ) : libraryFiles.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                            No se encontraron archivos en la biblioteca.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {libraryFiles.map(file => {
                              const isImg = file.mimeType?.startsWith('image/');
                              return (
                                <div 
                                  key={file.id} 
                                  onClick={() => handleSelectFromLibrary(file)}
                                  className="group border border-gray-150 rounded-2xl overflow-hidden hover:border-jn-red hover:shadow-lg transition-all bg-gray-50 cursor-pointer relative aspect-square flex flex-col justify-between"
                                >
                                  {/* Botón eliminar encima */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteFromLibrary(file.id, e)}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-600 hover:text-white rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                  >
                                    <Trash2 size={12} />
                                  </button>

                                  {/* Thumbnail */}
                                  <div className="flex-1 flex items-center justify-center overflow-hidden bg-white">
                                    {isImg ? (
                                      <img src={`${API_URL}${file.url}`} alt={file.name} className="max-w-full max-h-full object-contain" />
                                    ) : file.mimeType?.startsWith('video/') ? (
                                      <Video className="text-red-500" size={32} />
                                    ) : (
                                      <FileText className="text-gray-400" size={32} />
                                    )}
                                  </div>

                                  {/* Metadata al pie */}
                                  <div className="p-2 border-t bg-gray-100 text-[8px] font-black uppercase text-gray-500 space-y-0.5 truncate">
                                    <p className="truncate text-jn-black font-extrabold">{file.name || file.originalName}</p>
                                    <p className="font-mono text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
