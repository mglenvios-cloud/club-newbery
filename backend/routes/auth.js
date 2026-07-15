const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const router = express.Router();
const { JWT_SECRET } = require('../config/env');

// Registro de Usuario y Socio
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, dni, birthDate } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar un número de socio falso de manera simple
    const socioNumber = Math.floor(Math.random() * 90000) + 10000;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        member: {
          create: {
            socioNumber,
            firstName,
            lastName,
            dni,
            birthDate: new Date(birthDate),
            email
          }
        }
      },
      include: { member: true }
    });

    res.status(201).json({ message: 'Socio registrado exitosamente', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el socio' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { member: true } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { email: user.email, role: user.role, member: user.member } });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;
