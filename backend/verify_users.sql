-- Script para verificar datos creados
SELECT 
  r.name as role,
  COUNT(u.id) as total_usuarios,
  COUNT(CASE WHEN u.date_of_birth IS NOT NULL THEN 1 END) as con_datos_demograficos
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
GROUP BY r.name;
