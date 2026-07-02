insert into public.organizations (id, name)
values ('00000000-0000-4000-8000-000000000001', 'LC Consulting')
on conflict (id) do nothing;

insert into public.pipeline_stages (organization_id, name, position)
values
('00000000-0000-4000-8000-000000000001', 'nuevo lead', 1),
('00000000-0000-4000-8000-000000000001', 'contacto inicial', 2),
('00000000-0000-4000-8000-000000000001', 'diagnostico agendado', 3),
('00000000-0000-4000-8000-000000000001', 'propuesta enviada', 4),
('00000000-0000-4000-8000-000000000001', 'negociacion', 5),
('00000000-0000-4000-8000-000000000001', 'cliente ganado', 6),
('00000000-0000-4000-8000-000000000001', 'perdido', 7)
on conflict do nothing;

insert into public.clients (id, organization_id, name, industry, size, health, main_pain, services, revenue_estimate, since)
values
('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Optica Vista Clara', 'Optica y retail salud', '18 colaboradores', 'amarillo', 'Seguimiento inconsistente a prospectos y baja visibilidad de inventario.', array['Diagnostico operativo', 'Implementacion CRM', 'KPIs comerciales'], 92000, '2026-04-12'),
('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Ruta Frontera Logistics', 'Logistica y transporte', '64 colaboradores', 'rojo', 'Retrasos recurrentes, rutas sin medicion y comunicacion reactiva con clientes.', array['Rediseño de procesos', 'Tablero operativo'], 185000, '2026-03-03'),
('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'Aura Clinic', 'Clinica estetica', '27 colaboradores', 'verde', 'No existe lectura clara de conversion por tratamiento ni recompra.', array['Mejora de ventas', 'Campaña comercial'], 126000, '2026-05-08'),
('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'Industrias Calderon', 'Manufactura industrial', '120 colaboradores', 'amarillo', 'Procesos no documentados, retrabajos y costos indirectos sin control.', array['Estandarizacion de procesos'], 240000, '2026-02-18')
on conflict (id) do nothing;

insert into public.leads (organization_id, company, contact_name, email, phone, stage, estimated_value, close_probability, next_step, source, last_interaction)
values
('00000000-0000-4000-8000-000000000001', 'Optica Azul', 'Daniela Mora', 'daniela@opticaazul.mx', '+52 656 101 2244', 'diagnostico agendado', 78000, 64, 'Diagnostico operativo el jueves', 'Referido', '2026-06-29'),
('00000000-0000-4000-8000-000000000001', 'Transporte Alfa', 'Hector Salas', 'hector@alfa-log.mx', '+52 656 555 0189', 'propuesta enviada', 145000, 72, 'Ajustar alcance de tablero logistico', 'LinkedIn', '2026-06-28'),
('00000000-0000-4000-8000-000000000001', 'Clinica DermaNova', 'Paola Rios', 'paola@dermanova.mx', '+52 656 770 9011', 'negociacion', 118000, 81, 'Reunion con direccion financiera', 'Evento', '2026-06-30');

insert into public.projects (id, organization_id, client_id, name, objective, scope, starts_at, ends_at, status, priority, budget, progress, risks)
values
('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'CRM y seguimiento comercial', 'Aumentar conversion y visibilidad de oportunidades por sucursal.', 'Pipeline, campos, tablero, capacitacion y rutina semanal.', '2026-06-10', '2026-07-22', 'en progreso', 'alta', 88000, 58, array['Adopcion irregular por vendedores']),
('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'Control tower logistico', 'Reducir retrasos y crear seguimiento diario por ruta.', 'Mapa de flujo, tablero de rutas y ritual operativo.', '2026-05-20', '2026-07-31', 'en progreso', 'critica', 165000, 42, array['Datos de operadores llegan tarde']);

insert into public.tasks (organization_id, client_id, project_id, title, description, due_date, priority, status, checklist, relation)
values
('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Configurar etapas del pipeline optica', 'Nuevo lead, examen agendado, cotizacion, compra, recompra.', '2026-07-03', 'alta', 'en proceso', '[{"label":"Validar etapas","done":true},{"label":"Probar captura","done":false}]', 'Conversion consulta-venta'),
('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Tablero diario de entregas atrasadas', 'Vista por ruta, operador, cliente y causa raiz.', '2026-06-28', 'critica', 'bloqueada', '[{"label":"Definir causa raiz","done":true},{"label":"Conectar fuente despacho","done":false}]', 'Entregas a tiempo');

insert into public.kpis (id, organization_id, client_id, project_id, name, description, formula, current_value, target, unit, frequency, source, status)
values
('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Conversion consulta-venta', 'Porcentaje de examenes visuales que terminan en compra.', 'Ventas / consultas', 42, 58, '%', 'Semanal', 'CRM', 'alerta'),
('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Entregas a tiempo', 'Porcentaje de viajes entregados dentro de ventana prometida.', 'Entregas a tiempo / entregas totales', 71, 90, '%', 'Diaria', 'Despacho', 'critico');
