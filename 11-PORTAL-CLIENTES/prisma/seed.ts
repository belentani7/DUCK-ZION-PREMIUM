// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { db } from '../src/lib/db';
import { hash } from 'bcryptjs';

// ============ DATA DEFINITIONS ============

const clientDefs = [
  { name: 'María García', email: 'maria@techcorp.com', company: 'TechCorp', phone: '+34600111222', notes: 'Cliente prioritario, proyecto de rediseño web.' },
  { name: 'Carlos López', email: 'carlos@ecoenergy.com', company: 'EcoEnergy', phone: '+34600333444', notes: 'Interesado en soluciones de monitoreo solar.' },
  { name: 'Ana Martínez', email: 'ana@fincloud.com', company: 'FinCloud', phone: '+34600555666', notes: 'Necesitan plataforma de facturación electrónica.' },
  { name: 'Pedro Ruiz', email: 'pedro@greenlogistics.com', company: 'GreenLogistics', phone: '+34600777888', notes: 'Optimización de rutas de entrega.' },
  { name: 'Laura Sánchez', email: 'laura@healthtrack.io', company: 'HealthTrack', phone: '+34600999000', notes: 'App de seguimiento de salud personalizada.' },
  { name: 'Miguel Torres', email: 'miguel@smartbuild.es', company: 'SmartBuild', phone: '+34600111122', notes: 'Software de gestión para constructoras.' },
  { name: 'Isabel Moreno', email: 'isabel@educonnect.com', company: 'EduConnect', phone: '+34600333344', notes: 'Plataforma e-learning para universidades.' },
  { name: 'Diego Fernández', email: 'diego@foodfleet.es', company: 'FoodFleet', phone: '+34600555566', notes: 'Gestión de flotas de reparto de comida.' },
  { name: 'Sofia Herrera', email: 'sofia@luxrealestate.com', company: 'LuxRealEstate', phone: '+34600777788', notes: 'Portal inmobiliario de lujo con tours virtuales.' },
  { name: 'Andrés Jiménez', email: 'andres@autoparts.co', company: 'AutoParts Co.', phone: '+34600999900', notes: 'E-commerce de recambios automotrices.' },
  { name: 'Carmen Díaz', email: 'carmen@mediapro.tv', company: 'MediaPro TV', phone: '+34600112233', notes: 'Plataforma de streaming para contenidos deportivos.' },
  { name: 'Roberto Vega', email: 'roberto@agritech.com', company: 'AgriTech', phone: '+34600334455', notes: 'IoT para agricultura de precisión.' },
  { name: 'Elena Castro', email: 'elena@travelwise.es', company: 'TravelWise', phone: '+34600556677', notes: 'Motor de reservas para agencias de viaje.' },
  { name: 'Fernando Ortiz', email: 'fernando@legaltech.io', company: 'LegalTech', phone: '+34600778899', notes: 'Gestión documental para bufetes de abogados.' },
  { name: 'Patricia Navarro', email: 'patricia@petscare.es', company: 'PetCare', phone: '+34600990011', notes: 'App de veterinaria con teleconsulta.' },
  { name: 'Raúl Medina', email: 'raul@gamenexus.com', company: 'GameNexus', phone: '+34600112244', notes: 'Plataforma de distribución de videojuegos indie.' },
  { name: 'Lucia Romero', email: 'lucia@fashionhub.co', company: 'FashionHub', phone: '+34600334466', notes: 'Marketplace B2B de moda sostenible.' },
  { name: 'Javier Alonso', email: 'javier@cyberguard.io', company: 'CyberGuard', phone: '+34600556688', notes: 'Auditoría y monitorización de ciberseguridad.' },
  { name: 'Marta Gil', email: 'marta@cleanenergy.es', company: 'CleanEnergy', phone: '+34600778800', notes: 'Gestión de parques eólicos y solares.' },
  { name: 'Álvaro Delgado', email: 'alvaro@bookverse.com', company: 'BookVerse', phone: '+34600990022', notes: 'Plataforma de autopublicación y lectura social.' },
];

const projectDefs: { title: string; description: string; statuses: string[] }[] = [
  { title: 'Rediseño Web Corporativa', description: 'Nuevo sitio con identidad actualizada, optimizado para SEO y mobile-first.', statuses: ['In Progress', 'Completed', 'In Progress', 'Review', 'Discovery'] },
  { title: 'App de Monitoreo Solar', description: 'Dashboard en tiempo real de producción de paneles solares.', statuses: ['Discovery', 'In Progress', 'Review', 'Completed', 'In Progress'] },
  { title: 'Plataforma de Facturación', description: 'Automatización de cobros recurrentes con integración Stripe.', statuses: ['Review', 'In Progress', 'Completed', 'Discovery', 'In Progress'] },
  { title: 'App Móvil E-commerce', description: 'Aplicación móvil para tienda online con pagos integrados.', statuses: ['Completed', 'In Progress', 'Review', 'Completed', 'Discovery'] },
  { title: 'Sistema de Rutas Inteligentes', description: 'Optimización GPS con machine learning para flotas.', statuses: ['Discovery', 'Review', 'In Progress', 'In Progress', 'Completed'] },
  { title: 'Dashboard de Salud IoT', description: 'Monitoreo de constantes vitales con wearables.', statuses: ['In Progress', 'Discovery', 'In Progress', 'Review', 'In Progress'] },
  { title: 'ERP para Constructoras', description: 'Gestión integral de obras, materiales y personal.', statuses: ['Review', 'Completed', 'Discovery', 'In Progress', 'Review'] },
  { title: 'LMS Universitario', description: 'Plataforma e-learning con videoconferencia integrada.', statuses: ['Discovery', 'In Progress', 'Completed', 'Discovery', 'In Progress'] },
  { title: 'App de Reparto Food', description: 'Gestión de pedidos y rutas para repartidores.', statuses: ['In Progress', 'Review', 'In Progress', 'Completed', 'Review'] },
  { title: 'Portal Inmobiliario VR', description: 'Tours virtuales 360° para propiedades de lujo.', statuses: ['Completed', 'Discovery', 'Review', 'In Progress', 'In Progress'] },
  { title: 'Marketplace AutoParts', description: 'Catálogo con búsqueda por compatibility VIN.', statuses: ['In Progress', 'In Progress', 'Completed', 'Review', 'Discovery'] },
  { title: 'Streaming Deportivo', description: 'Plataforma OTT con HLS y multi-cámara.', statuses: ['Discovery', 'Completed', 'In Progress', 'In Progress', 'Review'] },
  { title: 'AgriTech IoT Dashboard', description: 'Sensores de suelo, clima y riego automatizado.', statuses: ['Review', 'In Progress', 'Discovery', 'Completed', 'In Progress'] },
  { title: 'Motor de Reservas B2B', description: 'Sistema multi-tenant para agencias de viaje.', statuses: ['In Progress', 'Discovery', 'In Progress', 'Review', 'Completed'] },
  { title: 'Gestión Documental Legal', description: 'Digitalización y firma electrónica de expedientes.', statuses: ['Completed', 'Review', 'In Progress', 'Discovery', 'In Progress'] },
  { title: 'TeleVet App', description: 'Consultas veterinarias por video y recetas digitales.', statuses: ['Discovery', 'In Progress', 'Review', 'In Progress', 'Completed'] },
  { title: 'Game Distribution Platform', description: 'Portal indie con DRM y sistema de achievements.', statuses: ['In Progress', 'Completed', 'Discovery', 'In Progress', 'Review'] },
  { title: 'Fashion B2B Marketplace', description: 'Marketplace mayorista con catálogos estacionales.', statuses: ['Review', 'Discovery', 'Completed', 'Review', 'In Progress'] },
  { title: 'Cybersecurity Dashboard', description: 'SOC virtual con alertas y respuesta automática.', statuses: ['In Progress', 'In Progress', 'In Progress', 'Discovery', 'Completed'] },
  { title: 'Energy Park Manager', description: 'Gestión centralizada de parques renovables.', statuses: ['Completed', 'Review', 'Review', 'In Progress', 'Discovery'] },
  { title: 'Social Reading Platform', description: 'Red social de lectores con recomendaciones AI.', statuses: ['Discovery', 'In Progress', 'Discovery', 'Completed', 'In Progress'] },
  { title: 'ChatBot Customer Service', description: 'Bot con NLP para atención al cliente multicanal.', statuses: ['In Progress', 'Review', 'In Progress', 'In Progress', 'Review'] },
  { title: 'CRM Avanzado', description: 'CRM con scoring de leads y automatización de funnel.', statuses: ['Review', 'Completed', 'Completed', 'Review', 'Discovery'] },
  { title: 'Fleet Analytics', description: 'Telemetría avanzada para flotas comerciales.', statuses: ['In Progress', 'Discovery', 'Review', 'Completed', 'In Progress'] },
  { title: 'HR Management Suite', description: 'Gestión de personal, nóminas y onboarding digital.', statuses: ['Discovery', 'In Progress', 'In Progress', 'Discovery', 'Completed'] },
  { title: 'Inventory WMS', description: 'Gestión de almacenes con RFID y picking optimizado.', statuses: ['Completed', 'Review', 'Discovery', 'In Progress', 'In Progress'] },
  { title: 'Patient Portal', description: 'Portal de pacientes con historial y citas online.', statuses: ['In Progress', 'In Progress', 'Completed', 'Review', 'Discovery'] },
  { title: 'Smart Parking System', description: 'Sensores IoT para gestión de plazas de aparcamiento.', statuses: ['Review', 'Discovery', 'In Progress', 'In Progress', 'Review'] },
  { title: 'Supply Chain Tracker', description: 'Trazabilidad de cadena de suministro con blockchain.', statuses: ['Discovery', 'Completed', 'Review', 'Completed', 'In Progress'] },
  { title: 'Wedding Planner App', description: 'Organización de bodas con proveedores y presupuestos.', statuses: ['In Progress', 'In Progress', 'Discovery', 'Discovery', 'Completed'] },
  { title: 'Restaurant POS', description: 'Sistema punto de venta con gestión de stock.', statuses: ['Completed', 'Review', 'In Progress', 'In Progress', 'Review'] },
  { title: 'Freelance Platform', description: 'Marketplace de freelancers con escrow de pagos.', statuses: ['Discovery', 'In Progress', 'Completed', 'Review', 'In Progress'] },
  { title: 'Event Ticketing', description: 'Venta de entradas con validación QR.', statuses: ['In Progress', 'Completed', 'Review', 'Completed', 'Discovery'] },
  { title: 'Home Automation Hub', description: 'Control centralizado de domótica con Alexa.', statuses: ['Review', 'Discovery', 'In Progress', 'Discovery', 'In Progress'] },
  { title: 'Crypto Portfolio Tracker', description: 'Dashboard de inversiones cripto con alertas.', statuses: ['Discovery', 'In Progress', 'Discovery', 'In Progress', 'Completed'] },
  { title: 'Delivery Route Optimizer', description: 'API de optimización de rutas con restricciones.', statuses: ['In Progress', 'Review', 'Completed', 'Review', 'In Progress'] },
  { title: 'Legal Contract Generator', description: 'Generación de contratos con plantillas inteligentes.', statuses: ['Completed', 'In Progress', 'In Progress', 'Discovery', 'Review'] },
  { title: 'Nutrition Planner', description: 'Planes nutricionales personalizados con IA.', statuses: ['Discovery', 'Completed', 'Review', 'In Progress', 'Discovery'] },
  { title: 'Co-Working Booking', description: 'Reserva de desks y salas en espacios co-working.', statuses: ['In Progress', 'Discovery', 'In Progress', 'Completed', 'In Progress'] },
  { title: 'Micro-Lending Platform', description: 'Préstamos P2P con scoring crediticio alternativo.', statuses: ['Review', 'In Progress', 'Completed', 'Review', 'Discovery'] },
  { title: 'Music Streaming API', description: 'Backend de streaming con recomendaciones.', statuses: ['In Progress', 'Review', 'Discovery', 'In Progress', 'Completed'] },
  { title: 'Waste Management', description: 'Gestión de residuos con rutas y reciclaje.', statuses: ['Discovery', 'Completed', 'Review', 'Discovery', 'In Progress'] },
  { title: 'Pet Adoption Portal', description: 'Adopción de animales con perfiles y matching.', statuses: ['Completed', 'In Progress', 'In Progress', 'Review', 'Review'] },
  { title: 'Budget Planner', description: 'App de finanzas personales con categorización.', statuses: ['In Progress', 'Discovery', 'Discovery', 'Completed', 'In Progress'] },
  { title: 'Artist Portfolio', description: 'Portfolios de artistas con tienda de prints.', statuses: ['Review', 'In Progress', 'Completed', 'In Progress', 'Discovery'] },
  { title: 'Security Camera AI', description: 'Análisis de vídeo con detección de anomalías.', statuses: ['Discovery', 'Completed', 'In Progress', 'Discovery', 'Review'] },
  { title: 'Language Exchange', description: 'App de intercambio de idiomas por videochat.', statuses: ['In Progress', 'Review', 'Review', 'In Progress', 'Completed'] },
  { title: 'Insurance Claims', description: 'Gestión de siniestros con subida de documentos.', statuses: ['Completed', 'In Progress', 'Discovery', 'Review', 'In Progress'] },
  { title: 'Recipe Sharing', description: 'Red social de recetas con paso a paso.', statuses: ['Discovery', 'Discovery', 'In Progress', 'Completed', 'Review'] },
  { title: 'Elderly Care Monitor', description: 'Monitoreo remoto para personas mayores.', statuses: ['In Progress', 'Completed', 'Completed', 'In Progress', 'Discovery'] },
  { title: 'Gym Management', description: 'Gestión de gimnasios con membresías y clases.', statuses: ['Review', 'In Progress', 'In Progress', 'Discovery', 'In Progress'] },
  { title: 'Crowdfunding Platform', description: 'Plataforma de micromecenazago con recompensas.', statuses: ['Discovery', 'Review', 'Discovery', 'Completed', 'Completed'] },
  { title: 'Real Estate CRM', description: 'CRM especializado para agentes inmobiliarios.', statuses: ['In Progress', 'Completed', 'Review', 'In Progress', 'In Progress'] },
  { title: 'Telemetry Dashboard', description: 'Dashboard de telemetría para maquinaria pesada.', statuses: ['Completed', 'In Progress', 'In Progress', 'Review', 'Discovery'] },
  { title: 'Voting System', description: 'Sistema de votación electrónica seguro.', statuses: ['Discovery', 'Discovery', 'Completed', 'In Progress', 'Review'] },
];

const deliverableTemplates = [
  { title: 'Wireframes & Bocetos', desc: 'Esquemas iniciales de todas las pantallas', statuses: ['Approved', 'In Review', 'Pending'] },
  { title: 'Diseño UI/UX en Figma', desc: 'Prototipo interactivo completo', statuses: ['Approved', 'In Review', 'Pending', 'Rejected'] },
  { title: 'Arquitectura Backend', desc: 'Diseño de APIs y modelo de datos', statuses: ['Approved', 'In Review', 'Pending'] },
  { title: 'Desarrollo Frontend', desc: 'Implementación de interfaz responsive', statuses: ['In Review', 'Pending', 'Approved'] },
  { title: 'Desarrollo Backend & APIs', desc: 'Servidor, endpoints y autenticación', statuses: ['In Review', 'Pending', 'Approved'] },
  { title: 'Integración de Pagos', desc: 'Stripe / PayPal checkout', statuses: ['Pending', 'In Review'] },
  { title: 'Testing & QA', desc: 'Pruebas unitarias, integración y E2E', statuses: ['Pending', 'In Review', 'Approved'] },
  { title: 'Despliegue & CI/CD', desc: 'Pipeline de despliegue automatizado', statuses: ['Pending', 'Approved'] },
  { title: 'Documentación Técnica', desc: 'Documentación de API y guía de uso', statuses: ['Pending', 'In Review'] },
  { title: 'Panel de Administración', desc: 'Dashboard admin con estadísticas', statuses: ['Pending', 'In Review', 'Approved'] },
  { title: 'Sistema de Notificaciones', desc: 'Push, email y in-app notifications', statuses: ['Pending'] },
  { title: 'Búsqueda & Filtros', desc: 'Motor de búsqueda con facets', statuses: ['In Review', 'Pending'] },
  { title: 'Módulo de Reportes', desc: 'Reportes exportables en PDF/Excel', statuses: ['Pending', 'In Review'] },
  { title: 'Mobile App (iOS/Android)', desc: 'App nativa o React Native', statuses: ['Pending', 'In Review'] },
  { title: 'API Gateway & Rate Limiting', desc: 'Gateway con throttling', statuses: ['Approved', 'Pending'] },
  { title: 'Data Migration', desc: 'Migración de datos desde sistema legacy', statuses: ['Approved', 'In Review'] },
  { title: 'Analytics Dashboard', desc: 'Métricas y KPIs con gráficos', statuses: ['Pending', 'In Review', 'Approved'] },
  { title: 'User Onboarding Flow', desc: 'Flujo de registro y bienvenida', statuses: ['Approved', 'Pending'] },
  { title: 'Multi-language Support', desc: 'i18n para 5 idiomas', statuses: ['Pending', 'In Review'] },
  { title: 'Performance Optimization', desc: 'CDN, lazy loading, caching', statuses: ['Pending', 'Approved'] },
];

const invoiceItemDescs = [
  'Diseño UX/UI', 'Desarrollo Frontend', 'Desarrollo Backend', 'Consultoría estratégica',
  'Reuniones de seguimiento', 'Auditoría técnica', 'Testing y QA', 'Despliegue en producción',
  'Documentación', 'Formación al equipo', 'Soporte técnico mensual', 'Mantenimiento preventivo',
  'Optimización SEO', 'Integración de APIs', 'Desarrollo móvil', 'Análisis de datos',
  'Gestión de proyecto', 'Infraestructura cloud', 'Seguridad y pentesting', 'Migración de datos',
];

const messageTemplates = [
  'Hola, quería consultar el estado actual del proyecto.',
  'Perfecto, seguimos con el cronograma previsto.',
  '¿Podemos agendar una reunión para esta semana?',
  'El cliente necesita una estimación actualizada.',
  'Los wireframes están listos para revisión.',
  'Tenemos un retraso por cambios de último momento.',
  '¿Podemos añadir esta nueva funcionalidad al sprint?',
  'Las pruebas han detectado 3 bugs críticos.',
  'El deploy a staging fue exitoso.',
  'El cliente está muy satisfecho con los resultados.',
  'Necesito acceso a las credenciales del servidor.',
  'La facturación del mes anterior está pendiente.',
  'Vamos a requerir más tiempo para el módulo de pagos.',
  '¿Cuándo podemos hacer la demo con el equipo?',
  'El rendimiento de la app mejoró un 40%.',
  'Hay un conflicto de versiones en la dependencia principal.',
  'La nueva iteración del diseño está mucho mejor.',
  'El presupuesto se ha ajustado correctamente.',
  'Las métricas de uso son muy positivas.',
  'Revisaremos los requisitos el lunes por la mañana.',
  'El cliente ha aprobado el prototipo final.',
  'Necesitamos un retroactivo con el equipo de QA.',
  'La integración con el proveedor externo está lista.',
  '¿Podemos escalar los recursos del servidor?',
  'El nuevo diseño responsive funciona perfectamente.',
  'Los tests de carga muestran buena estabilidad.',
  'He actualizado la documentación técnica.',
  'El cliente solicita una llamada urgente.',
  'La migración de la base de datos fue exitosa.',
  'Vamos a presentar los avances mañana a las 10h.',
  'El módulo de reportes necesita ajustes menores.',
  'La seguridad del sistema ha sido auditada.',
  'El onboarding del cliente está programado.',
  'Hemos reducido el tiempo de carga a 1.2s.',
  'El despliegue en producción está completado.',
  'Necesitamos feedback sobre la nueva función.',
  'El backlog tiene 12 historias pendientes.',
  'La retrospective del sprint fue muy productiva.',
  'El análisis competitivo revela oportunidades.',
  'El prototipo de alta fidelidad está listo.',
  'Vamos a hacer pruebas de usuario mañana.',
  'El cliente quiere priorizar la app móvil.',
  'Hemos alcanzado el 90% de cobertura de tests.',
];

// Notification templates
const notifTypes = ['info', 'warning', 'success', 'reminder'] as const;
const notifTitleContentPairs = [
  { type: 'info', title: 'Nuevo proyecto creado', getContent: (pn: string, cn: string) => `Se ha creado el proyecto "${pn}" para ${cn}.` },
  { type: 'info', title: 'Actualización de proyecto', getContent: (pn: string) => `El proyecto "${pn}" ha sido actualizado con nuevos detalles.` },
  { type: 'info', title: 'Miembro asignado', getContent: (pn: string) => `Un nuevo miembro ha sido asignado al proyecto "${pn}".` },
  { type: 'info', title: 'Documento compartido', getContent: (pn: string) => `Se ha compartido un nuevo documento en el proyecto "${pn}".` },
  { type: 'warning', title: 'Entregable próximo a vencer', getContent: (dn: string, pn: string) => `El entregable "${dn}" del proyecto "${pn}" está próximo a su fecha límite.` },
  { type: 'warning', title: 'Factura vencida', getContent: (inv: string) => `La factura ${inv} ha superado la fecha de vencimiento.` },
  { type: 'warning', title: 'Presupuesto al 90%', getContent: (pn: string) => `El proyecto "${pn}" ha consumido el 90% del presupuesto asignado.` },
  { type: 'warning', title: 'Riesgo de retraso', getContent: (pn: string) => `El proyecto "${pn}" presenta riesgo de retraso según el cronograma.` },
  { type: 'warning', title: 'Salud del cliente baja', getContent: (cn: string) => `El cliente ${cn} tiene un health score bajo. Se recomienda acción.` },
  { type: 'success', title: 'Entregable aprobado', getContent: (dn: string) => `El entregable "${dn}" ha sido aprobado por el cliente.` },
  { type: 'success', title: 'Pago recibido', getContent: (inv: string, amt: number) => `Se ha recibido el pago de ${inv} por €${amt.toLocaleString('es-ES')}.` },
  { type: 'success', title: 'Proyecto completado', getContent: (pn: string) => `¡El proyecto "${pn}" ha sido marcado como completado!` },
  { type: 'success', title: 'Hito alcanzado', getContent: (m: string, pn: string) => `Se ha alcanzado el hito "${m}" en el proyecto "${pn}".` },
  { type: 'success', title: 'Demo exitosa', getContent: (pn: string) => `La demo del proyecto "${pn}" fue exitosa. El cliente quedó satisfecho.` },
  { type: 'reminder', title: 'Reunión programada', getContent: (cn: string) => `Tienes una reunión programada con ${cn} mañana a las 10:00h.` },
  { type: 'reminder', title: 'Revisión semanal pendiente', getContent: (pn: string) => `Recuerda completar la revisión semanal del proyecto "${pn}".` },
  { type: 'reminder', title: 'Factura por enviar', getContent: (cn: string) => `Tienes una factura pendiente de enviar a ${cn}.` },
  { type: 'reminder', title: 'Seguimiento de cliente', getContent: (cn: string) => `Hace más de 7 días sin actividad con ${cn}. Realiza un seguimiento.` },
  { type: 'reminder', title: 'Reporte mensual', getContent: () => `Recuerda preparar el reporte mensual de proyectos.` },
];

// Seeded random for reproducibility
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}
const rng = seededRandom(42);
const rand = () => rng();
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const randChoice = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

async function seed() {
  console.log('🗑️  Cleaning existing data...');
  await db.activity.deleteMany();
  await db.notification.deleteMany();
  await db.message.deleteMany();
  await db.invoiceItem.deleteMany();
  await db.invoice.deleteMany();
  await db.deliverable.deleteMany();
  await db.project.deleteMany();
  await db.client.deleteMany();
  await db.user.deleteMany();

  const now = Date.now();
  const day = 86400000;

  // ============ 1. ADMIN USER ============
  const adminPassword = await hash('Admin123!', 10);
  const admin = await db.user.create({
    data: { email: 'admin@portal.com', password: adminPassword, role: 'admin', fullName: 'Admin Principal', company: 'Mi Agencia' },
  });
  console.log('✅ Admin created');

  // ============ 2. CLIENT USERS + CLIENTS ============
  const clientPassword = await hash('Cliente123!', 10);
  const clientUsers: { id: string }[] = [];
  const clients: { id: string; companyName: string; userId: string }[] = [];

  for (let i = 0; i < clientDefs.length; i++) {
    const c = clientDefs[i];
    const user = await db.user.create({
      data: { email: c.email, password: clientPassword, role: 'client', fullName: c.name, company: c.company },
    });
    clientUsers.push(user);
    const client = await db.client.create({
      data: {
        userId: user.id, companyName: c.company, contactEmail: c.email, phone: c.phone, notes: c.notes,
        healthScore: 40 + randInt(0, 60),
        churnRisk: Math.round(rand() * 50) / 100,
      },
    });
    clients.push(client);
  }
  console.log(`✅ ${clients.length} clients created (with healthScore & churnRisk)`);

  // ============ 3. PROJECTS (55) using createMany ============
  const projectData = projectDefs.map((def, i) => {
    const clientIndex = i % clients.length;
    const statusIdx = i % def.statuses.length;
    const startOffset = -(randInt(0, 120)) * day;
    const endOffset = startOffset + (30 + randInt(0, 180)) * day;
    const versionNum = Math.floor(i / def.statuses.length) + 1;
    const title = versionNum > 1 ? `${def.title} v${versionNum}` : def.title;
    return {
      clientId: clients[clientIndex].id,
      title,
      description: def.description,
      status: def.statuses[statusIdx],
      startDate: new Date(now + startOffset),
      targetEndDate: new Date(now + endOffset),
      progress: 0,
    };
  });

  // We need IDs back, so we create them with a transaction and select
  await db.project.createMany({ data: projectData });
  const allProjects = await db.project.findMany({ select: { id: true, clientId: true, title: true, status: true as const }, orderBy: { createdAt: 'asc' } });
  console.log(`✅ ${allProjects.length} projects created`);

  // ============ 4. DELIVERABLES ============
  const deliverableData: { projectId: string; title: string; description: string; dueDate: Date; status: string }[] = [];
  let dIdx = 0;
  for (const project of allProjects) {
    const numD = 3 + randInt(0, 3);
    for (let d = 0; d < numD; d++) {
      const tmpl = deliverableTemplates[dIdx % deliverableTemplates.length];
      const dueOffset = (rand() > 0.5 ? 1 : -1) * (5 + randInt(0, 60)) * day;
      deliverableData.push({
        projectId: project.id, title: tmpl.title, description: tmpl.desc,
        dueDate: new Date(now + dueOffset), status: randChoice(tmpl.statuses),
      });
      dIdx++;
    }
  }
  await db.deliverable.createMany({ data: deliverableData });
  const allDeliverables = await db.deliverable.findMany({ select: { id: true, projectId: true, status: true as const } });
  console.log(`✅ ${allDeliverables.length} deliverables created`);

  // ============ 5. INVOICES ============
  const invoiceData: { clientId: string; invoiceNumber: string; issueDate: Date; dueDate: Date; status: string; totalAmount: number; notes: string }[] = [];
  let invCount = 0;
  // Track invoice details per client for later use
  const clientInvoiceDetails: Map<string, { invoiceNumber: string; totalAmount: number; status: string }[]> = new Map();

  for (const client of clients) {
    const numInv = 4 + randInt(0, 2);
    const details: { invoiceNumber: string; totalAmount: number; status: string }[] = [];
    for (let inv = 0; inv < numInv; inv++) {
      const status = randChoice(['Draft', 'Sent', 'Paid', 'Overdue']);
      const issueOffset = -(10 + randInt(0, 90)) * day;
      const dueOffset = issueOffset + (15 + randInt(0, 45)) * day;
      const totalAmount = 500 + randInt(0, 9500);
      const invNum = `INV-${String(100 + invCount + 1).padStart(4, '0')}`;
      invoiceData.push({
        clientId: client.id, invoiceNumber: invNum,
        issueDate: new Date(now + issueOffset), dueDate: new Date(now + dueOffset),
        status, totalAmount,
        notes: status === 'Overdue' ? 'Factura vencida - requiere seguimiento.' : `Factura periodo ${new Date(now + issueOffset).toLocaleDateString('es-ES', { month: 'long' })}.`,
      });
      details.push({ invoiceNumber: invNum, totalAmount, status });
      invCount++;
    }
    clientInvoiceDetails.set(client.id, details);
  }
  await db.invoice.createMany({ data: invoiceData });
  const allInvoices = await db.invoice.findMany({ select: { id: true, clientId: true, invoiceNumber: true, totalAmount: true, status: true }, orderBy: { createdAt: 'asc' } });
  console.log(`✅ ${allInvoices.length} invoices created`);

  // ============ 6. INVOICE ITEMS ============
  const itemData: { invoiceId: string; description: string; quantity: number; unitPrice: number }[] = [];
  let itIdx = 0;
  for (const invoice of allInvoices) {
    const numItems = 2 + randInt(0, 3);
    let remaining = invoice.totalAmount;
    for (let item = 0; item < numItems; item++) {
      const isLast = item === numItems - 1;
      const desc = invoiceItemDescs[itIdx % invoiceItemDescs.length];
      const qty = 1 + randInt(0, 4);
      let unitPrice: number;
      if (isLast) {
        unitPrice = Math.max(0.01, Math.round((remaining / qty) * 100) / 100);
      } else {
        const remainingLines = numItems - item;
        const lineBudget = remaining / remainingLines;
        unitPrice = Math.max(0.01, Math.round((lineBudget / qty) * 100) / 100);
        remaining -= unitPrice * qty;
      }
      itemData.push({ invoiceId: invoice.id, description: desc, quantity: qty, unitPrice });
      itIdx++;
    }
  }
  await db.invoiceItem.createMany({ data: itemData });
  console.log(`✅ ${itemData.length} invoice items created`);

  // ============ 7. MESSAGES ============
  const messageData: { senderId: string; recipientId: string; content: string; isRead: boolean; createdAt: Date }[] = [];
  let msgCount = 0;
  for (const clientUser of clientUsers) {
    const numMsgs = 8 + randInt(0, 5);
    for (let m = 0; m < numMsgs; m++) {
      const fromClient = m % 2 === 0;
      messageData.push({
        senderId: fromClient ? clientUser.id : admin.id,
        recipientId: fromClient ? admin.id : clientUser.id,
        content: messageTemplates[msgCount % messageTemplates.length],
        isRead: m < numMsgs - 2,
        createdAt: new Date(now - (numMsgs - m) * (1 + rand() * 4) * 3600000),
      });
      msgCount++;
    }
  }
  await db.message.createMany({ data: messageData });
  console.log(`✅ ${msgCount} messages created`);

  // ============ 8. UPDATE CLIENT totalRevenue ============
  // Use raw SQL for efficiency
  await db.$executeRawUnsafe(`
    UPDATE Client SET totalRevenue = (
      SELECT COALESCE(SUM("totalAmount"), 0) FROM Invoice WHERE Invoice."clientId" = Client.id AND Invoice.status = 'Paid'
    )
  `);
  console.log(`✅ Client totalRevenue updated`);

  // ============ 9. UPDATE PROJECT progress ============
  await db.$executeRawUnsafe(`
    UPDATE Project SET progress = (
      SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(CAST((SUM(CASE WHEN status = 'Approved' THEN 100 WHEN status = 'In Review' THEN 50 ELSE 0 END) * 1.0 / COUNT(*)) AS INTEGER))
      END
      FROM Deliverable WHERE Deliverable."projectId" = Project.id
    )
  `);
  console.log(`✅ Project progress updated`);

  // ============ 10. NOTIFICATIONS (30+ per user + 40 for admin) ============
  const notifData: { senderId: string | null; userId: string; title: string; content: string; type: string; read: boolean; link: string | null; createdAt: Date }[] = [];
  let notifCount = 0;

  for (let u = 0; u < clientUsers.length; u++) {
    const clientUser = clientUsers[u];
    const client = clients[u];
    const clientProjects = allProjects.filter(p => p.clientId === client.id);
    const clientInvDetails = clientInvoiceDetails.get(client.id) || [];
    const numNotifs = 30 + randInt(0, 5);

    for (let n = 0; n < numNotifs; n++) {
      const tmpl = notifTitleContentPairs[n % notifTitleContentPairs.length];
      const pn = clientProjects.length > 0 ? clientProjects[n % clientProjects.length].title : 'Proyecto X';
      const invD = clientInvDetails.length > 0 ? clientInvDetails[n % clientInvDetails.length] : { invoiceNumber: 'INV-0000', totalAmount: 0 };
      const dn = deliverableTemplates[n % deliverableTemplates.length].title;

      let content = '';
      try {
        const args = [pn, client.companyName, dn, invD.invoiceNumber, invD.totalAmount, 'Fase 2'];
        content = (tmpl.getContent as (...a: unknown[]) => string)(...args.slice(0, (tmpl.getContent as (...a: unknown[]) => string).length));
      } catch {
        content = `Notificación del proyecto ${pn}`;
      }

      notifData.push({
        senderId: admin.id,
        userId: clientUser.id,
        title: tmpl.title,
        content: content as string,
        type: tmpl.type,
        read: n < numNotifs - 5,
        link: clientProjects.length > 0 ? `/projects/${clientProjects[n % clientProjects.length].id}` : null,
        createdAt: new Date(now - n * (1 + rand() * 3) * day),
      });
      notifCount++;
    }
  }

  // Admin notifications (40)
  for (let n = 0; n < 40; n++) {
    const tmpl = notifTitleContentPairs[n % notifTitleContentPairs.length];
    const rc = clients[n % clients.length];
    const rp = allProjects[n % allProjects.length];
    const ri = allInvoices[n % allInvoices.length];
    const dn = deliverableTemplates[n % deliverableTemplates.length].title;

    let content = '';
    try {
      const args = [rp.title, rc.companyName, dn, ri.invoiceNumber, ri.totalAmount, 'Fase 2'];
      content = (tmpl.getContent as (...a: unknown[]) => string)(...args.slice(0, (tmpl.getContent as (...a: unknown[]) => string).length));
    } catch {
      content = `Notificación del proyecto ${rp.title}`;
    }

    notifData.push({
      senderId: null, userId: admin.id, title: tmpl.title, content: content as string,
      type: tmpl.type, read: n < 35, link: null,
      createdAt: new Date(now - n * (1 + rand() * 2) * day),
    });
    notifCount++;
  }
  await db.notification.createMany({ data: notifData });
  console.log(`✅ ${notifCount} notifications created`);

  // ============ 11. ACTIVITIES (55+ = 1-2 per project) ============
  const actActions = [
    'project.created', 'project.updated', 'project.status_changed',
    'invoice.sent', 'invoice.paid', 'invoice.overdue',
    'deliverable.completed', 'deliverable.approved', 'deliverable.rejected',
    'client.updated', 'client.onboarded', 'message.sent',
  ];
  const actDescriptions: Record<string, (pn: string, cn: string, inv: string, dn: string, status?: string) => string> = {
    'project.created': (pn, cn) => `Proyecto "${pn}" creado para ${cn}`,
    'project.updated': (pn) => `Se actualizó la descripción del proyecto "${pn}"`,
    'project.status_changed': (pn, _cn, _inv, _dn, s?: string) => `El proyecto "${pn}" cambió a estado ${s || 'actualizado'}`,
    'invoice.sent': (_pn, cn) => `Factura enviada a ${cn}`,
    'invoice.paid': (_pn, cn) => `Factura de ${cn} marcada como pagada`,
    'invoice.overdue': (_pn, cn) => `Factura de ${cn} ha vencido`,
    'deliverable.completed': (pn) => `Entregable completado en "${pn}"`,
    'deliverable.approved': (pn) => `Entregable aprobado en "${pn}"`,
    'deliverable.rejected': (pn) => `Entregable rechazado en "${pn}" — requiere revisiones`,
    'client.updated': (_pn, cn) => `Datos de ${cn} actualizados`,
    'client.onboarded': (_pn, cn) => `${cn} completó el proceso de onboarding`,
    'message.sent': (_pn, cn) => `Mensaje enviado en la conversación con ${cn}`,
  };

  const actData: { projectId: string | null; clientId: string; userId: string; action: string; description: string; metadata: string | null; createdAt: Date }[] = [];
  let actCount = 0;

  for (let i = 0; i < allProjects.length; i++) {
    const project = allProjects[i];
    const client = clients.find(c => c.id === project.clientId)!;
    const numActs = 1 + randInt(0, 1);
    for (let a = 0; a < numActs; a++) {
      const action = actActions[actCount % actActions.length];
      const descFn = actDescriptions[action] || ((pn: string) => `Actividad en "${pn}"`);
      const invD = (clientInvoiceDetails.get(client.id) || [])[0];
      const desc = descFn(project.title, client.companyName, invD?.invoiceNumber || '', deliverableTemplates[actCount % deliverableTemplates.length].title, project.status);
      actData.push({
        projectId: project.id, clientId: client.id, userId: admin.id,
        action, description: desc as string,
        metadata: JSON.stringify({ projectId: project.id, clientId: client.id }),
        createdAt: new Date(now - actCount * (2 + rand() * 5) * day),
      });
      actCount++;
    }
  }
  await db.activity.createMany({ data: actData });
  console.log(`✅ ${actCount} activities created`);

  // ============ SUMMARY ============
  const total = 1 + clientUsers.length + clients.length + allProjects.length + allDeliverables.length + allInvoices.length + itemData.length + msgCount + notifCount + actCount;
  console.log('\n' + '═'.repeat(50));
  console.log('   SEED COMPLETE - DATA SUMMARY');
  console.log('═'.repeat(50));
  console.log(`   👤 Admin Users:        1`);
  console.log(`   👥 Client Users:       ${clientUsers.length}`);
  console.log(`   🏢 Clients:            ${clients.length}`);
  console.log(`   📁 Projects:           ${allProjects.length}`);
  console.log(`   📋 Deliverables:       ${allDeliverables.length}`);
  console.log(`   🧾 Invoices:           ${allInvoices.length}`);
  console.log(`   📝 Invoice Items:      ${itemData.length}`);
  console.log(`   💬 Messages:           ${msgCount}`);
  console.log(`   🔔 Notifications:      ${notifCount}`);
  console.log(`   📊 Activities:         ${actCount}`);
  console.log(`   ─────────────────────────`);
  console.log(`   📊 TOTAL DATA POINTS:  ${total}`);
  console.log('═'.repeat(50));
  console.log('\n🔑 Credenciales de acceso:');
  console.log('   Admin:     admin@portal.com / Admin123!');
  console.log(`   Clients:   ${clientDefs[0].email} / Cliente123!`);
  console.log(`              ${clientDefs[1].email} / Cliente123!`);
  console.log(`              ${clientDefs[2].email} / Cliente123!`);
  console.log(`              ... y ${clientDefs.length - 3} clientes más`);
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
