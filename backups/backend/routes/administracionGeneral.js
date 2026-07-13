const express = require('express');
const router = express.Router();

const clubConfigService = require('../modules/administracionGeneral/services/clubConfig.service');
const seasonsService = require('../modules/administracionGeneral/services/seasons.service');
const disciplinesService = require('../modules/administracionGeneral/services/disciplines.service');
const facilitiesService = require('../modules/administracionGeneral/services/facilities.service');
const usersService = require('../modules/administracionGeneral/services/users.service');

const validators = require('../modules/administracionGeneral/validators/administracionGeneral.validators');
const { logError } = require('../modules/gestionDeportiva/utils/errorLogger');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN GENERAL DEL CLUB
// ═══════════════════════════════════════════════════════════════════════════

router.get('/club-config', async (req, res) => {
  try {
    const config = await clubConfigService.get(1);
    res.json(config);
  } catch (error) {
    logError({ module: 'ClubConfigRoute', action: 'get', error, req });
    res.status(500).json({ error: 'Error al obtener la configuración del club' });
  }
});

router.put('/club-config', async (req, res) => {
  try {
    const validationError = validators.validateClubConfig(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const config = await clubConfigService.update(1, req.body);
    res.json(config);
  } catch (error) {
    logError({ module: 'ClubConfigRoute', action: 'update', error, req });
    res.status(500).json({ error: 'Error al actualizar la configuración del club' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TEMPORADAS (SEASONS)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/seasons', async (req, res) => {
  try {
    const seasons = await seasonsService.getAll(1);
    res.json(seasons);
  } catch (error) {
    logError({ module: 'SeasonsRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener temporadas' });
  }
});

router.post('/seasons', async (req, res) => {
  try {
    const validationError = validators.validateSeason(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const season = await seasonsService.create(1, req.body);
    res.status(201).json(season);
  } catch (error) {
    logError({ module: 'SeasonsRoute', action: 'create', error, req });
    res.status(500).json({ error: 'Error al crear temporada' });
  }
});

router.put('/seasons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const validationError = validators.validateSeason(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const season = await seasonsService.update(parseInt(id), req.body);
    res.json(season);
  } catch (error) {
    logError({ module: 'SeasonsRoute', action: 'update', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar temporada' });
  }
});

router.delete('/seasons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    await seasonsService.remove(parseInt(id));
    res.json({ message: 'Temporada eliminada' });
  } catch (error) {
    logError({ module: 'SeasonsRoute', action: 'delete', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al eliminar temporada' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DISCIPLINAS (DISCIPLINES)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/disciplines', async (req, res) => {
  try {
    const disciplines = await disciplinesService.getAll(1);
    res.json(disciplines);
  } catch (error) {
    logError({ module: 'DisciplinesRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener disciplinas' });
  }
});

router.post('/disciplines', async (req, res) => {
  try {
    const validationError = validators.validateDiscipline(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const discipline = await disciplinesService.create(1, req.body);
    res.status(201).json(discipline);
  } catch (error) {
    logError({ module: 'DisciplinesRoute', action: 'create', error, req });
    res.status(500).json({ error: 'Error al crear disciplina' });
  }
});

router.put('/disciplines/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const validationError = validators.validateDiscipline(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const discipline = await disciplinesService.update(parseInt(id), req.body);
    res.json(discipline);
  } catch (error) {
    logError({ module: 'DisciplinesRoute', action: 'update', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar disciplina' });
  }
});

router.delete('/disciplines/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    await disciplinesService.remove(parseInt(id));
    res.json({ message: 'Disciplina eliminada' });
  } catch (error) {
    logError({ module: 'DisciplinesRoute', action: 'delete', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al eliminar disciplina' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SEDES
// ═══════════════════════════════════════════════════════════════════════════

router.get('/sedes', async (req, res) => {
  try {
    const sedes = await facilitiesService.getAllSedes(1);
    res.json(sedes);
  } catch (error) {
    logError({ module: 'SedesRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener sedes' });
  }
});

router.post('/sedes', async (req, res) => {
  try {
    const validationError = validators.validateSede(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const sede = await facilitiesService.createSede(1, req.body);
    res.status(201).json(sede);
  } catch (error) {
    logError({ module: 'SedesRoute', action: 'create', error, req });
    res.status(500).json({ error: 'Error al crear sede' });
  }
});

router.put('/sedes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const validationError = validators.validateSede(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const sede = await facilitiesService.updateSede(parseInt(id), req.body);
    res.json(sede);
  } catch (error) {
    logError({ module: 'SedesRoute', action: 'update', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar sede' });
  }
});

router.delete('/sedes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    await facilitiesService.removeSede(parseInt(id));
    res.json({ message: 'Sede eliminada' });
  } catch (error) {
    logError({ module: 'SedesRoute', action: 'delete', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al eliminar sede' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// INSTALACIONES (FACILITIES)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/facilities', async (req, res) => {
  const { sedeId } = req.query;
  try {
    const facilities = await facilitiesService.getAllFacilities(sedeId);
    res.json(facilities);
  } catch (error) {
    logError({ module: 'FacilitiesRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener instalaciones' });
  }
});

router.post('/facilities', async (req, res) => {
  try {
    const validationError = validators.validateFacility(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const facility = await facilitiesService.createFacility(req.body);
    res.status(201).json(facility);
  } catch (error) {
    logError({ module: 'FacilitiesRoute', action: 'create', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al crear instalación' });
  }
});

router.put('/facilities/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const validationError = validators.validateFacility(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const facility = await facilitiesService.updateFacility(parseInt(id), req.body);
    res.json(facility);
  } catch (error) {
    logError({ module: 'FacilitiesRoute', action: 'update', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar instalación' });
  }
});

router.delete('/facilities/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    await facilitiesService.removeFacility(parseInt(id));
    res.json({ message: 'Instalación eliminada' });
  } catch (error) {
    logError({ module: 'FacilitiesRoute', action: 'delete', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al eliminar instalación' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ROLES
// ═══════════════════════════════════════════════════════════════════════════

router.get('/roles', async (req, res) => {
  try {
    const roles = await usersService.getAllRoles(1);
    res.json(roles);
  } catch (error) {
    logError({ module: 'RolesRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});

router.post('/roles', async (req, res) => {
  try {
    const validationError = validators.validateRole(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const role = await usersService.createRole(1, req.body);
    res.status(201).json(role);
  } catch (error) {
    logError({ module: 'RolesRoute', action: 'create', error, req });
    res.status(500).json({ error: 'Error al crear rol' });
  }
});

router.put('/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const validationError = validators.validateRole(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    const role = await usersService.updateRole(parseInt(id), req.body);
    res.json(role);
  } catch (error) {
    logError({ module: 'RolesRoute', action: 'update', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar rol' });
  }
});

router.delete('/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    await usersService.removeRole(parseInt(id));
    res.json({ message: 'Rol eliminado' });
  } catch (error) {
    logError({ module: 'RolesRoute', action: 'delete', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al eliminar rol' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// USUARIOS (USERS)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/users', async (req, res) => {
  try {
    const users = await usersService.getAllUsers(1);
    // Remover contraseñas por seguridad
    const cleanedUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(cleanedUsers);
  } catch (error) {
    logError({ module: 'UsersRoute', action: 'getAll', error, req });
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const validationError = validators.validateUser(req.body, false);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const user = await usersService.createUser(1, req.body);
    const { password, ...cleanedUser } = user;
    res.status(201).json(cleanedUser);
  } catch (error) {
    logError({ module: 'UsersRoute', action: 'create', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al crear usuario' });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    const validationError = validators.validateUser(req.body, true);
    if (validationError) return res.status(400).json({ error: validationError });

    const user = await usersService.updateUser(parseInt(id), req.body);
    const { password, ...cleanedUser } = user;
    res.json(cleanedUser);
  } catch (error) {
    logError({ module: 'UsersRoute', action: 'update', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al actualizar usuario' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idError = validators.validateId(id);
    if (idError) return res.status(400).json({ error: idError });

    await usersService.removeUser(parseInt(id));
    res.json({ message: 'Usuario eliminado del sistema' });
  } catch (error) {
    logError({ module: 'UsersRoute', action: 'delete', error, req });
    res.status(error.statusCode || 500).json({ error: error.message || 'Error al eliminar usuario' });
  }
});

module.exports = router;
