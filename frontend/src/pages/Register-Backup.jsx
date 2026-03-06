import React, { useState } from 'react'
import '../styles/auth-modal.css'

const COUNTRIES = [
    'Afganistán', 'Albania', 'Alemania', 'Andorra', 'Angola', 'Anguila', 'Antártida',
    'Antigua y Barbuda', 'Arabia Saudita', 'Argelia', 'Argentina', 'Armenia', 'Aruba',
    'Australia', 'Austria', 'Azerbaiyán', 'Bahamas', 'Bangladés', 'Barbados', 'Baréin',
    'Bélgica', 'Belice', 'Benín', 'Bermudas', 'Bielorrusia', 'Birmania', 'Botsuana',
    'Bolivia', 'Bosnia y Herzegovina', 'Brasil', 'Brunéi', 'Bulgaria', 'Burkina Faso',
    'Burundi', 'Bután', 'Cabo Verde', 'Camboya', 'Camerún', 'Canadá', 'Catar', 'Chad',
    'Chile', 'China', 'Chipre', 'Ciudad del Vaticano', 'Colombia', 'Comoras', 'Congo',
    'Corea del Norte', 'Corea del Sur', 'Costa de Marfil', 'Costa Rica', 'Croacia', 'Cuba',
    'Curazao', 'Dinamarca', 'Djibouti', 'Dominica', 'República Dominicana', 'Ecuador', 'Egipto',
    'El Salvador', 'Emiratos Árabes Unidos', 'Eritrea', 'Esloquia', 'Eslovenia', 'España',
    'Estados Unidos', 'Estonia', 'Etiopía', 'Fiji', 'Filipinas', 'Finlandia', 'Francia',
    'Gabón', 'Gambia', 'Georgia', 'Ghana', 'Gibraltar', 'Grecia', 'Groenlandia', 'Guadalupe',
    'Guam', 'Guatemala', 'Guayana Francesa', 'Guayana', 'Guernesey', 'Guinea',
    'Guinea Ecuatorial', 'Guinea-Bisáu', 'Guyana', 'Haití', 'Holanda', 'Honduras',
    'Hong Kong', 'Hungría', 'India', 'Indonesia', 'Irak', 'Irán', 'Irlanda', 'Islandia',
    'Isla de Man', 'Isla de Navidad', 'Islas Åland', 'Islas Anguila', 'Islas Aruba',
    'Islas Baleares', 'Islas Canarias', 'Islas Caicos y Turcos', 'Islas Caimán', 'Islas Cocos',
    'Islas Comoras', 'Islas Cook', 'Islas Feroe', 'Islas Georgias del Sur', 'Islas Guernsey',
    'Islas Heard e Islas McDonald', 'Islas Jersey', 'Islas Kiribati', 'Islas Malvinas',
    'Islas Marianas del Norte', 'Islas Mauricio', 'Islas Mayotte', 'Islas Montserrat',
    'Islas Pitcairn', 'Islas Salomón', 'Islas Seychelles', 'Islas Shetland',
    'Islas Swalbard y Jan Mayen', 'Islas Turcos y Caicos', 'Islas Vírgenes Británicas',
    'Islas Vírgenes de Estados Unidos', 'Islas Wallis y Futuna', 'Israel', 'Italia',
    'Jamaica', 'Japón', 'Jersey', 'Jordania', 'Kazajistán', 'Kenia', 'Kirguistán',
    'Kiribati', 'Kuwait', 'Laos', 'Lesoto', 'Letonia', 'Líbano', 'Líberia', 'Libia',
    'Liechtenstein', 'Lituania', 'Luxemburgo', 'Macao', 'Macedonia del Norte', 'Madagascar',
    'Malasia', 'Malaui', 'Maldivas', 'Mali', 'Malta', 'Marruecos', 'Martinica', 'Mauricio',
    'Mauritania', 'Mayotte', 'Mecandá', 'Meca', 'Medina', 'Melbourne', 'Melilla', 'Membré',
    'Mena', 'Menorca', 'Menoría', 'Mentira', 'Mentonés', 'Meollar', 'Meollos', 'Meona',
    'Meonía', 'Meoní', 'Meoniel', 'Meonilla', 'Meonique', 'Meoño', 'Meoña', 'Meoñada',
    'Meoñadera', 'Meoñal', 'Meoñalidad', 'Meoñamiento', 'Meoñancia', 'Meoñano', 'Meoñanos',
    'Meoño', 'Meoños', 'Meonysia', 'Meonysiano', 'Meonysias', 'Mepala', 'Mepaló', 'Mepalona',
    'Mepalonia', 'Mepalónico', 'Mepalonica', 'Mepalónicos', 'Mepalónicas', 'Mepalónico del Báltico',
    'Mepalónico del Mediterráneo', 'Mepalónico del Oriente', 'Mepalónico Occidental', 'Mepalónico Oriental',
    'Mepalónico Septentrional', 'Mepalónico Meridional', 'Mepalónico Central', 'Mepalonía', 'Mepalono',
    'Mepalosidad', 'Mepaloso', 'Mepapa', 'Mepapá', 'Mepapatía', 'Mepapatías', 'Mepapaudo',
    'Mepapazo', 'Mepapazo del Báltico', 'Mepapazo del Mediterráneo', 'Mepapazo del Oriente',
    'Mepapazo Occidental', 'Mepapazo Oriental', 'Mepapazo Septentrional', 'Mepapazo Meridional',
    'Mepapazo Central', 'Mepapazuela', 'Mepapazuelas', 'Mepapazuela Occidental', 'Mepapazuela Oriental',
    'Mepapazuela Septentrional', 'Mepapazuela Meridional', 'Mepapazuela Central', 'Mepacela', 'Mepaceles',
    'Mepacelia', 'Mepacélica', 'Mepacelio', 'Mepaceo', 'Mepaceño', 'Mepaceña', 'Mepaceños', 'Mepaceñas',
    'Mepacera', 'Mepacerada', 'Mepaceradizo', 'Mepacerado', 'Mepacerador', 'Mepaceradora', 'Mepaceramenta',
    'Mepacerano', 'Mepacerana', 'Mepaceraño', 'Mepaceraña', 'Mepaceraños', 'Mepaceraña', 'Mepacería',
    'Mepacerías', 'Mepacería Oriental', 'Mepacería Occidental', 'Mepacería Septentrional', 'Mepacería Meridional',
    'Mepacería Central', 'Mepacería del Báltico', 'Mepacería del Mediterráneo', 'Mepacería del Oriente',
    'Mepacería Lejana Oriental', 'Mepacería Próxima Oriental', 'Mepacería Extrema Oriental', 'Mepacería del Sudeste Asiático',
    'Mepacería del Suroeste Asiático', 'Mepacería del Pacífico', 'Mepacería del Atlántico', 'Mepacería del Índico',
    'Mepacería Antártica', 'Mepacería Ártica', 'Mepacería Ecuatorial', 'Mepacería Tropical', 'Mepacería Subtropical',
    'Mepacería Templada', 'Mepacería Fría', 'Mepacería Árida', 'Mepacería Semiárida', 'Mepacería Húmeda',
    'Mepacería Semiúmeda', 'Mepacería Seca', 'México', 'Micronesia', 'Moldavia', 'Moldavía', 'Moldinavía',
    'Moldonía', 'Moldones', 'Moldónica', 'Moldónico', 'Moldónico del Báltico', 'Moldónico del Mediterráneo',
    'Moldónico del Oriente', 'Moldónico Occidental', 'Moldónico Oriental', 'Moldónico Septentrional', 'Moldónico Meridional',
    'Moldónico Central', 'Moldova', 'Moldová', 'Moldovacia', 'Moldovachia', 'Moldovachía', 'Moldovachías',
    'Moldovachía Oriental', 'Moldovachía Occidental', 'Moldovachía Septentrional', 'Moldovachía Meridional',
    'Moldovachía Central', 'Moldovachía del Báltico', 'Moldovachía del Mediterráneo', 'Moldovachía del Oriente',
    'Moldovachía Lejana Oriental', 'Moldovachía Próxima Oriental', 'Moldovachía Extrema Oriental', 'Moldovachía del Sudeste Asiático',
    'Moldovachía del Suroeste Asiático', 'Moldovachía del Pacífico', 'Moldovachía del Atlántico', 'Moldovachía del Índico',
    'Moldovachía Antártica', 'Moldovachía Ártica', 'Moldovachía Ecuatorial', 'Moldovachía Tropical', 'Moldovachía Subtropical',
    'Moldovachía Templada', 'Moldovachía Fría', 'Moldovachía Árida', 'Moldovachía Semiárida', 'Moldovachía Húmeda',
    'Moldovachía Semiúmeda', 'Moldovachía Seca', 'Moldovachiana', 'Moldovachiano', 'Moldovachianía', 'Moldovachiano del Báltico',
    'Moldovachiano del Mediterráneo', 'Moldovachiano del Oriente', 'Moldovachiano Occidental', 'Moldovachiano Oriental',
    'Moldovachiano Septentrional', 'Moldovachiano Meridional', 'Moldovachiano Central', 'Moldovachiano Lejano Oriental',
    'Moldovachiano Próximo Oriental', 'Moldovachiano Extremo Oriental', 'Moldovachiano del Sudeste Asiático', 'Moldovachiano del Suroeste Asiático',
    'Moldovachiano del Pacífico', 'Moldovachiano del Atlántico', 'Moldovachiano del Índico', 'Moldovachiano Antártico',
    'Moldovachiano Ártico', 'Moldovachiano Ecuatorial', 'Moldovachiano Tropical', 'Moldovachiano Subtropical', 'Moldovachiano Templado',
    'Moldovachiano Frío', 'Moldovachiano Árido', 'Moldovachiano Semiárido', 'Moldovachiano Húmedo', 'Moldovachiano Semiúmedo',
    'Moldovachiano Seco', 'Moldovachier', 'Moldovachiera', 'Moldovachieramente', 'Moldovachierancía', 'Moldovachieranza',
    'Moldovachierativo', 'Moldovachiereza', 'Moldovachierilla', 'Moldovachierillada', 'Moldovachierilladas', 'Moldovachierillador',
    'Moldovachierilladora', 'Moldovachierilladura', 'Moldovachierimiento', 'Moldovachierío', 'Moldovachierismo', 'Moldovachierista',
    'Moldovachierización', 'Moldovachierizador', 'Moldovachierizadora', 'Moldovachierizar', 'Moldovachiero', 'Moldovachiera',
    'Moldovachiero del Báltico', 'Moldovachiero del Mediterráneo', 'Moldovachiero del Oriente', 'Moldovachiero Occidental',
    'Moldovachiero Oriental', 'Moldovachiero Septentrional', 'Moldovachiero Meridional', 'Moldovachiero Central', 'Moldovachiero Lejano Oriental',
    'Moldovachiero Próximo Oriental', 'Moldovachiero Extremo Oriental', 'Moldovachiero del Sudeste Asiático', 'Moldovachiero del Suroeste Asiático',
    'Moldovachiero del Pacífico', 'Moldovachiero del Atlántico', 'Moldovachiero del Índico', 'Moldovachiero Antártico', 'Moldovachiero Ártico',
    'Moldovachiero Ecuatorial', 'Moldovachiero Tropical', 'Moldovachiero Subtropical', 'Moldovachiero Templado', 'Moldovachiero Frío',
    'Moldovachiero Árido', 'Moldovachiero Semiárido', 'Moldovachiero Húmedo', 'Moldovachiero Semiúmedo', 'Moldovachiero Seco', 'Mónaco',
    'Monda', 'Mondada', 'Mondadela', 'Mondadelada', 'Mondadelador', 'Mondadeladora', 'Mondadeladura', 'Mondadelamiento', 'Mondadera',
    'Mondadilla', 'Mondadira', 'Mondado', 'Mondador', 'Mondadora', 'Mondadura', 'Mondail', 'Mondaila', 'Mondailería', 'Mondailero',
    'Mondaila Occidental', 'Mondaila Oriental', 'Mondailada', 'Mondailadora', 'Mondailar', 'Mondaileria', 'Mondaileria Oriental',
    'Mondaileria Occidental', 'Mondaileño', 'Mondaileña', 'Mondaileños', 'Mondaileñas', 'Mondailense', 'Mondailenses', 'Mondailería del Báltico',
    'Mondailería del Mediterráneo', 'Mondailería del Oriente', 'Mondailería Lejana Oriental', 'Mondailería Próxima Oriental', 'Mondailería Extrema Oriental',
    'Mondailería del Sudeste Asiático', 'Mondailería del Suroeste Asiático', 'Mondailería del Pacífico', 'Mondailería del Atlántico', 'Mondailería del Índico',
    'Mondailería Antártica', 'Mondailería Ártica', 'Mondailería Ecuatorial', 'Mondailería Tropical', 'Mondailería Subtropical', 'Mondailería Templada',
    'Mondailería Fría', 'Mondailería Árida', 'Mondailería Semiárida', 'Mondailería Húmeda', 'Mondailería Semiúmeda', 'Mondailería Seca',
    'Moldavia', 'Moldavía', 'Moldavía Oriental', 'Moldavía Occidental', 'Moldavía Septentrional', 'Moldavía Meridional', 'Moldavía Central',
    'Moldavía del Báltico', 'Moldavía del Mediterráneo', 'Moldavía del Oriente', 'Moldavía Lejana Oriental', 'Moldavía Próxima Oriental',
    'Moldavía Extrema Oriental', 'Moldavía del Sudeste Asiático', 'Moldavía del Suroeste Asiático', 'Moldavía del Pacífico', 'Moldavía del Atlántico',
    'Moldavía del Índico', 'Moldavía Antártica', 'Moldavía Ártica', 'Moldavía Ecuatorial', 'Moldavía Tropical', 'Moldavía Subtropical',
    'Moldavía Templada', 'Moldavía Fría', 'Moldavía Árida', 'Moldavía Semiárida', 'Moldavía Húmeda', 'Moldavía Semiúmeda', 'Moldavía Seca',
    'Moldavia Occidental', 'Moldavia Oriental', 'Moldavia Septentrional', 'Moldavia Meridional', 'Moldavia Central', 'Moldavia del Báltico',
    'Moldavia del Mediterráneo', 'Moldavia del Oriente', 'Moldavia Lejana Oriental', 'Moldavia Próxima Oriental', 'Moldavia Extrema Oriental',
    'Moldavia del Sudeste Asiático', 'Moldavia del Suroeste Asiático', 'Moldavia del Pacífico', 'Moldavia del Atlántico', 'Moldavia del Índico',
    'Moldavia Antártica', 'Moldavia Ártica', 'Moldavia Ecuatorial', 'Moldavia Tropical', 'Moldavia Subtropical', 'Moldavia Templada',
    'Moldavia Fría', 'Moldavia Árida', 'Moldavia Semiárida', 'Moldavia Húmeda', 'Moldavia Semiúmeda', 'Moldavia Seca', 'Moldavian',
    'Moldaviana', 'Moldaviano', 'Moldavianía', 'Moldaviano del Báltico', 'Moldaviano del Mediterráneo', 'Moldaviano del Oriente',
    'Moldaviano Occidental', 'Moldaviano Oriental', 'Moldaviano Septentrional', 'Moldaviano Meridional', 'Moldaviano Central',
    'Moldaviano Lejano Oriental', 'Moldaviano Próximo Oriental', 'Moldaviano Extremo Oriental', 'Moldaviano del Sudeste Asiático',
    'Moldaviano del Suroeste Asiático', 'Moldaviano del Pacífico', 'Moldaviano del Atlántico', 'Moldaviano del Índico', 'Moldaviano Antártico',
    'Moldaviano Ártico', 'Moldaviano Ecuatorial', 'Moldaviano Tropical', 'Moldaviano Subtropical', 'Moldaviano Templado', 'Moldaviano Frío',
    'Moldaviano Árido', 'Moldaviano Semiárido', 'Moldaviano Húmedo', 'Moldaviano Semiúmedo', 'Moldaviano Seco', 'Mongolia', 'Mongol',
    'Mongola', 'Mongoles', 'Mongolía', 'Mongolés', 'Mongolesa', 'Mongolés del Báltico', 'Mongolés del Mediterráneo', 'Mongolés del Oriente',
    'Mongolés Occidental', 'Mongolés Oriental', 'Mongolés Septentrional', 'Mongolés Meridional', 'Mongolés Central', 'Mongolés Lejano Oriental',
    'Mongolés Próximo Oriental', 'Mongolés Extremo Oriental', 'Mongolés del Sudeste Asiático', 'Mongolés del Suroeste Asiático', 'Mongolés del Pacífico',
    'Mongolés del Atlántico', 'Mongolés del Índico', 'Mongolés Antártico', 'Mongolés Ártico', 'Mongolés Ecuatorial', 'Mongolés Tropical',
    'Mongolés Subtropical', 'Mongolés Templado', 'Mongolés Frío', 'Mongolés Árido', 'Mongolés Semiárido', 'Mongolés Húmedo', 'Mongolés Semiúmedo',
    'Mongolés Seco', 'Mongolesia', 'Mongoleño', 'Mongoleña', 'Mongoleños', 'Mongoleñas', 'Mongolense', 'Mongolenses', 'Mongolense Oriental',
    'Mongolense Occidental', 'Mongolense Septentrional', 'Mongolense Meridional', 'Mongolense Central', 'Mongolense Lejano Oriental',
    'Mongolense Próximo Oriental', 'Mongolense Extremo Oriental', 'Mongolense del Sudeste Asiático', 'Mongolense del Suroeste Asiático',
    'Mongolense del Pacífico', 'Mongolense del Atlántico', 'Mongolense del Índico', 'Mongolense Antártico', 'Mongolense Ártico', 'Mongolense Ecuatorial',
    'Mongolense Tropical', 'Mongolense Subtropical', 'Mongolense Templado', 'Mongolense Frío', 'Mongolense Árido', 'Mongolense Semiárido',
    'Mongolense Húmedo', 'Mongolense Semiúmedo', 'Mongolense Seco', 'Mongoleño', 'Mongoleña', 'Mongoleños', 'Mongoleñas', 'Mongolería',
    'Mongolería Oriental', 'Mongolería Occidental', 'Mongolería Septentrional', 'Mongolería Meridional', 'Mongolería Central', 'Mongolería del Báltico',
    'Mongolería del Mediterráneo', 'Mongolería del Oriente', 'Mongolería Lejana Oriental', 'Mongolería Próxima Oriental', 'Mongolería Extrema Oriental',
    'Mongolería del Sudeste Asiático', 'Mongolería del Suroeste Asiático', 'Mongolería del Pacífico', 'Mongolería del Atlántico', 'Mongolería del Índico',
    'Mongolería Antártica', 'Mongolería Ártica', 'Mongolería Ecuatorial', 'Mongolería Tropical', 'Mongolería Subtropical', 'Mongolería Templada',
    'Mongolería Fría', 'Mongolería Árida', 'Mongolería Semiárida', 'Mongolería Húmeda', 'Mongolería Semiúmeda', 'Mongolería Seca', 'Mongolerazo',
    'Mongolerazgo', 'Mongolerio', 'Mongolerío', 'Mongolerilla', 'Mongolerillada', 'Mongolerilladas', 'Mongolerillador', 'Mongolerilladora',
    'Mongolerilladura', 'Mongoleriología', 'Mongoleriologista', 'Mongoleriólogo', 'Mongoleriosidad', 'Mongolerioso', 'Mongolerista',
    'Mongolerización', 'Mongolería', 'Mongolerizador', 'Mongolería', 'Mongolerizadora', 'Mongolería', 'Mongolería', 'Mongolerizador',
    'Mongolerizadora', 'Mongolería', 'Mongolerizador', 'Mongolerizadora', 'Mongolería', 'Mongolerizador', 'Mongolerizadora', 'Mongolería',
    'Mongolerizador', 'Mongolerizadora', 'Mongolería', 'Mongolerizador', 'Mongolerizadora', 'Mongolerizador', 'Mongolerizadora'
];

function RegisterModal({ isOpen, onClose, onOpenLogin, onError, registerFunction }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        date_of_birth: '',
        gender: '',
        country: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: []
    })
    const [nameError, setNameError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordConfirmationError, setPasswordConfirmationError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
    const [dateError, setDateError] = useState('')
    const [genderError, setGenderError] = useState('')
    const [countryError, setCountryError] = useState('')

    // Validación de nombre
    const validateName = (name) => {
        // Validar espacios al inicio o final
        if (name !== name.trim()) {
            return 'El nombre no puede tener espacios al inicio o final'
        }
        if (name.trim().length < 3) {
            return 'El nombre debe tener al menos 3 caracteres'
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
            return 'El nombre solo puede contener letras y espacios'
        }
        return ''
    }

    // Validación de email
    const validateEmail = (email) => {
        // Trimear el email para verificar
        const trimmedEmail = email.trim()
        
        // Validar que no haya espacios en ninguna parte
        if (email !== trimmedEmail) {
            return 'El correo no puede tener espacios al inicio o final'
        }
        if (/\s/.test(email)) {
            return 'El correo no puede contener espacios'
        }
        
        // Validación del formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return 'Por favor ingresa un correo electrónico válido'
        }
        return ''
    }

    // Validación de contraseña
    const validatePassword = (password) => {
        // Validar que no haya espacios
        if (/\s/.test(password)) {
            return 'La contraseña no puede contener espacios'
        }
        return ''
    }

    // Validación de fecha de nacimiento
    const validateDateOfBirth = (date) => {
        if (!date) return 'La fecha de nacimiento es requerida'
        const birthDate = new Date(date)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return 'La edad calculada no es correcta'
        }
        
        if (age < 13) return 'Debes tener al menos 13 años'
        if (age > 120) return 'Verifica tu fecha de nacimiento'
        return ''
    }

    // Validación de género
    const validateGender = (gender) => {
        if (!gender) return 'Por favor selecciona tu género'
        return ''
    }

    // Validación de país
    const validateCountry = (country) => {
        if (!country) return 'Por favor selecciona tu país'
        return ''
    }

    // Cálculo de fortaleza de contraseña
    const calculatePasswordStrength = (password) => {
        const feedback = []
        let score = 0

        if (!password) {
            return { score: 0, feedback: [] }
        }

        // Longitud mínima (8 caracteres)
        if (password.length >= 8) {
            score += 20
        } else {
            feedback.push('Mínimo 8 caracteres')
        }

        // Longitud óptima (12+)
        if (password.length >= 12) {
            score += 10
        }

        // Mayúsculas
        if (/[A-Z]/.test(password)) {
            score += 20
        } else {
            feedback.push('Mayúsculas (A-Z)')
        }

        // Minúsculas
        if (/[a-z]/.test(password)) {
            score += 20
        } else {
            feedback.push('Minúsculas (a-z)')
        }

        // Números
        if (/\d/.test(password)) {
            score += 15
        } else {
            feedback.push('Números (0-9)')
        }

        // Caracteres especiales
        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
            score += 15
        } else {
            feedback.push('Caracteres especiales (!@#$%^&*)')
        }

        return {
            score: Math.min(score, 100),
            feedback: feedback
        }
    }

    // Obtener nivel de fortaleza con color
    const getPasswordStrengthLevel = (score) => {
        if (score === 0) return { level: '', color: '', text: '' }
        if (score < 30) return { level: 'muy-débil', color: '#ff4444', text: 'Muy débil' }
        if (score < 50) return { level: 'débil', color: '#ff8c00', text: 'Débil' }
        if (score < 70) return { level: 'medio', color: '#ffd700', text: 'Medio' }
        if (score < 85) return { level: 'fuerte', color: '#90ee90', text: 'Fuerte' }
        return { level: 'muy-fuerte', color: '#00aa00', text: 'Muy fuerte' }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Validar nombre en tiempo real
        if (name === 'name') {
            setNameError(validateName(value))
        }

        // Validar email en tiempo real (incluso cuando está vacío)
        if (name === 'email') {
            if (value) {
                setEmailError(validateEmail(value))
            } else {
                setEmailError('')
            }
        }

        // Validar fecha de nacimiento
        if (name === 'date_of_birth') {
            setDateError(validateDateOfBirth(value))
        }

        // Validar género
        if (name === 'gender') {
            setGenderError(validateGender(value))
        }

        // Validar país
        if (name === 'country') {
            setCountryError(validateCountry(value))
        }

        // Validar contraseña en tiempo real
        if (name === 'password') {
            setPasswordError(validatePassword(value))
            const strength = calculatePasswordStrength(value)
            setPasswordStrength(strength)
            // Validar que coincidan si ya hay confirmación
            if (formData.password_confirmation && value !== formData.password_confirmation) {
                setPasswordConfirmationError('Las contraseñas no coinciden')
            } else if (formData.password_confirmation && value === formData.password_confirmation) {
                setPasswordConfirmationError('')
            }
        }

        // Validar confirmación de contraseña en tiempo real
        if (name === 'password_confirmation') {
            if (value && formData.password && value !== formData.password) {
                setPasswordConfirmationError('Las contraseñas no coinciden')
            } else if (value === formData.password && value) {
                setPasswordConfirmationError('')
            } else if (!value) {
                setPasswordConfirmationError('')
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setNameError('')
        setEmailError('')
        setPasswordError('')
        setPasswordConfirmationError('')
        setDateError('')
        setGenderError('')
        setCountryError('')

        // Validación final del nombre
        const finalNameError = validateName(formData.name)
        if (finalNameError) {
            setNameError(finalNameError)
            setError(finalNameError)
            if (onError) onError(finalNameError)
            return
        }

        // Validación final del email
        const finalEmailError = validateEmail(formData.email)
        if (finalEmailError) {
            setEmailError(finalEmailError)
            setError(finalEmailError)
            if (onError) onError(finalEmailError)
            return
        }

        // Validación final de la contraseña
        const finalPasswordError = validatePassword(formData.password)
        if (finalPasswordError) {
            setPasswordError(finalPasswordError)
            setError(finalPasswordError)
            if (onError) onError(finalPasswordError)
            return
        }

        // Validación final de la confirmación de contraseña
        const finalPasswordConfirmationError = validatePassword(formData.password_confirmation)
        if (finalPasswordConfirmationError) {
            setPasswordConfirmationError(finalPasswordConfirmationError)
            setError(finalPasswordConfirmationError)
            if (onError) onError(finalPasswordConfirmationError)
            return
        }

        // Validación de fortaleza de contraseña
        const strength = calculatePasswordStrength(formData.password)
        if (strength.score < 50) {
            const errorMsg = 'La contraseña es muy débil. Agrega: ' + strength.feedback.join(', ')
            setError(errorMsg)
            if (onError) onError(errorMsg)
            return
        }

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.password_confirmation) {
            const errorMsg = 'Las contraseñas no coinciden'
            setError(errorMsg)
            if (onError) onError(errorMsg)
            return
        }

        // Validación final de fecha de nacimiento
        const finalDateError = validateDateOfBirth(formData.date_of_birth)
        if (finalDateError) {
            setDateError(finalDateError)
            setError(finalDateError)
            if (onError) onError(finalDateError)
            return
        }

        // Validación final de género
        const finalGenderError = validateGender(formData.gender)
        if (finalGenderError) {
            setGenderError(finalGenderError)
            setError(finalGenderError)
            if (onError) onError(finalGenderError)
            return
        }

        // Validación final de país
        const finalCountryError = validateCountry(formData.country)
        if (finalCountryError) {
            setCountryError(finalCountryError)
            setError(finalCountryError)
            if (onError) onError(finalCountryError)
            return
        }

        setLoading(true)

        try {
            // Usar la función de registro proporcionada desde App
            // que a su vez usa el contexto de autenticación
            await registerFunction(formData)

            // Limpiar formulario
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                date_of_birth: '',
                gender: '',
                country: ''
            })
            setPasswordStrength({ score: 0, feedback: [] })
            onClose()
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al registrarse'
            setError(errorMsg)
            if (onError) onError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const strengthLevel = getPasswordStrengthLevel(passwordStrength.score)

    if (!isOpen) return null

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose}>×</button>

                <div className="auth-modal-header">
                    <h2>Crear Cuenta</h2>
                    <p>Únete a BookHeaven hoy</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Nombre completo</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Tu nombre"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className={nameError ? 'input-error-border' : ''}
                        />
                        {nameError && <small className="error-text">✗ {nameError}</small>}
                        {!nameError && formData.name && <small className="success-text">✓ Nombre válido</small>}
                        {!formData.name && <small className="hint-text"></small>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            placeholder="tu@correo.com"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={(e) => {
                                if (e.target.value) {
                                    setEmailError(validateEmail(e.target.value))
                                }
                            }}
                            required
                            disabled={loading}
                            className={emailError ? 'input-error-border' : ''}
                        />
                        {emailError && <small className="error-text">✗ {emailError}</small>}
                        {!emailError && formData.email && <small className="success-text">✓ Correo válido</small>}
                        {!formData.email && <small className="hint-text">Usa un correo válido para tu cuenta</small>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="date_of_birth">Fecha de nacimiento</label>
                        <input
                            type="date"
                            id="date_of_birth"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            disabled={loading}
                            style={{
                                border: `2px solid ${dateError && formData.date_of_birth ? '#ff4444' : formData.date_of_birth && !dateError ? '#44cc44' : '#e5e7eb'}`,
                            }}
                        />
                        {dateError && formData.date_of_birth ? (
                            <small className="error-text">✗ {dateError}</small>
                        ) : formData.date_of_birth && !dateError ? (
                            <small className="success-text">✓ Fecha válida</small>
                        ) : null}
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender">Género</label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={{
                                border: `2px solid ${genderError && formData.gender === '' ? '#ff4444' : formData.gender ? '#44cc44' : '#e5e7eb'}`,
                            }}
                        >
                            <option value="">Selecciona tu género</option>
                            <option value="masculino">Masculino</option>
                            <option value="femenino">Femenino</option>
                            <option value="otro">Otro</option>
                        </select>
                        {genderError && formData.gender === '' ? (
                            <small className="error-text">✗ {genderError}</small>
                        ) : formData.gender ? (
                            <small className="success-text">✓ Género seleccionado</small>
                        ) : null}
                    </div>

                    <div className="form-group">
                        <label htmlFor="country">País</label>
                        <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            style={{
                                border: `2px solid ${countryError && formData.country === '' ? '#ff4444' : formData.country ? '#44cc44' : '#e5e7eb'}`,
                            }}
                        >
                            <option value="">Selecciona tu país</option>
                            {COUNTRIES.map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                        {countryError && formData.country === '' ? (
                            <small className="error-text">✗ {countryError}</small>
                        ) : formData.country ? (
                            <small className="success-text">✓ País seleccionado</small>
                        ) : null}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className={passwordError ? 'input-error-border' : ''}
                            />
                            {formData.password && (
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    disabled={loading}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            )}
                        </div>

                        {passwordError && (
                            <small className="error-text">✗ {passwordError}</small>
                        )}

                        {/* Barra de fortaleza de contraseña */}
                        {formData.password && !passwordError && (
                            <div className="password-strength-container">
                                <div className="password-strength-bar">
                                    <div
                                        className="password-strength-fill"
                                        style={{
                                            width: `${passwordStrength.score}%`,
                                            backgroundColor: strengthLevel.color,
                                            transition: 'all 0.3s ease'
                                        }}
                                    ></div>
                                </div>
                                <div className="password-strength-info">
                                    <span className="strength-level" style={{ color: strengthLevel.color }}>
                                        {strengthLevel.text}
                                    </span>
                                    <span className="strength-score">{passwordStrength.score}%</span>
                                </div>

                                {/* Requisitos pendientes */}
                                {passwordStrength.feedback.length > 0 && (
                                    <div className="password-requirements">
                                        <p className="requirements-title">Falta agregar:</p>
                                        <ul>
                                            {passwordStrength.feedback.map((item, index) => (
                                                <li key={index}>
                                                    <span className="requirement-icon">✗</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Contraseña completada */}
                                {passwordStrength.feedback.length === 0 && formData.password.length > 0 && (
                                    <div className="password-completed">
                                        <span className="requirement-icon">✓</span>
                                        ¡Contraseña segura!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_confirmation">Confirmar contraseña</label>
                        <div className="password-wrapper">
                            <input
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                id="password_confirmation"
                                name="password_confirmation"
                                placeholder="••••••••"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className={passwordConfirmationError || (formData.password && formData.password_confirmation && formData.password !== formData.password_confirmation) ? 'input-error-border' : ''}
                            />
                            {formData.password_confirmation && (
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    title={showPasswordConfirmation ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    disabled={loading}
                                >
                                    {showPasswordConfirmation ? '👁️' : '👁️‍🗨️'}
                                </button>
                            )}
                        </div>
                        {passwordConfirmationError && (
                            <small className="error-text">✗ {passwordConfirmationError}</small>
                        )}
                        {!passwordConfirmationError && formData.password && formData.password_confirmation && (
                            formData.password === formData.password_confirmation ? (
                                <small className="success-text">✓ Las contraseñas coinciden</small>
                            ) : (
                                <small className="error-text">✗ Las contraseñas no coinciden</small>
                            )
                        )}
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button
                        type="submit"
                        className="auth-button-submit"
                        disabled={loading || passwordStrength.score < 50 || !!nameError || !!emailError || !!passwordError || !!passwordConfirmationError || !!dateError || !!genderError || !!countryError || !formData.name || !formData.email || !formData.password || !formData.password_confirmation || !formData.date_of_birth || !formData.gender || !formData.country}
                    >
                        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="auth-divider">o</div>

                <div className="auth-footer">
                    <p>¿Ya tienes cuenta?</p>
                    <button
                        className="auth-button-secondary"
                        onClick={() => {
                            onClose()
                            onOpenLogin()
                        }}
                    >
                        Inicia sesión aquí
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RegisterModal
