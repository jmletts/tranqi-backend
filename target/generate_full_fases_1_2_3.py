import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for margin_name, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(margin_name)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_heading_with_spacing(doc, text, level, space_before=16, space_after=6, color_rgb=(27, 54, 93)):
    p = doc.add_heading(text, level=level)
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.keep_with_next = True
    for run in p.runs:
        run.font.name = 'Calibri'
        run.font.color.rgb = RGBColor(*color_rgb)
    return p

def add_paragraph_styled(doc, text, bold_prefix="", space_after=6, line_spacing=1.15):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.bold = True
        r_bold.font.name = 'Calibri'
        r_bold.font.size = Pt(11)
        r_bold.font.color.rgb = RGBColor(27, 54, 93)
    r_text = p.add_run(text)
    r_text.font.name = 'Calibri'
    r_text.font.size = Pt(11)
    r_text.font.color.rgb = RGBColor(51, 51, 51)
    return p

def add_callout(doc, title, text, border_color="1B365D", bg_color="F0F4F8"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    r_title = p.add_run(f"📌 {title}\n")
    r_title.bold = True
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(10.5)
    r_title.font.color.rgb = RGBColor(27, 54, 93)
    
    r_text = p.add_run(text)
    r_text.font.name = 'Calibri'
    r_text.font.size = Pt(10)
    r_text.font.color.rgb = RGBColor(55, 65, 81)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)

def build_complete_document():
    doc = docx.Document()
    
    # Page setup
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
    # =============================================================
    # CARÁTULA
    # =============================================================
    p_uni = doc.add_paragraph()
    p_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_uni.paragraph_format.space_before = Pt(20)
    p_uni.paragraph_format.space_after = Pt(4)
    r_uni = p_uni.add_run("UNIVERSIDAD CONTINENTAL")
    r_uni.bold = True
    r_uni.font.name = 'Calibri'
    r_uni.font.size = Pt(20)
    r_uni.font.color.rgb = RGBColor(27, 54, 93)
    
    p_fac = doc.add_paragraph()
    p_fac.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_fac.paragraph_format.space_after = Pt(16)
    r_fac = p_fac.add_run("FACULTAD DE INGENIERÍA\nCARRERA PROFESIONAL DE INGENIERÍA DE SISTEMAS E INFORMÁTICA")
    r_fac.bold = True
    r_fac.font.name = 'Calibri'
    r_fac.font.size = Pt(11.5)
    r_fac.font.color.rgb = RGBColor(71, 85, 105)
    
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line.paragraph_format.space_after = Pt(20)
    r_line = p_line.add_run("____________________________________________________________")
    r_line.font.color.rgb = RGBColor(197, 155, 39)
    
    p_eval = doc.add_paragraph()
    p_eval.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eval.paragraph_format.space_after = Pt(4)
    r_eval = p_eval.add_run("EVALUACIÓN DEL CONSOLIDADO 1.2")
    r_eval.bold = True
    r_eval.font.name = 'Calibri'
    r_eval.font.size = Pt(13)
    r_eval.font.color.rgb = RGBColor(180, 83, 9)
    
    p_course = doc.add_paragraph()
    p_course.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_course.paragraph_format.space_after = Pt(14)
    r_course = p_course.add_run("PRUEBAS Y CALIDAD DE SOFTWARE")
    r_course.bold = True
    r_course.font.name = 'Calibri'
    r_course.font.size = Pt(17)
    r_course.font.color.rgb = RGBColor(27, 54, 93)
    
    p_topic = doc.add_paragraph()
    p_topic.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_topic.paragraph_format.space_after = Pt(26)
    r_topic = p_topic.add_run("Diseño e Implementación Básica de Gestión de Configuración del Software (SCM)\nFASE 1: Identificación de la Configuración\nFASE 2: Diseño del Proceso de Control de Cambios\nFASE 3: Implementación con Herramienta de Configuración")
    r_topic.font.name = 'Calibri'
    r_topic.font.size = Pt(12)
    r_topic.font.italic = True
    r_topic.font.color.rgb = RGBColor(51, 65, 85)
    
    card_table = doc.add_table(rows=5, cols=2)
    card_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    card_table.autofit = False
    card_table.columns[0].width = Inches(2.3)
    card_table.columns[1].width = Inches(4.2)
    
    data_portada = [
        ("Proyecto Analizado:", "Tranki - Backend Central de Recaudo de Transporte Público"),
        ("Repositorio Evaluado:", "jmletts/tranqi-backend (Java 21 / Spring Boot 3 / Cucumber)"),
        ("Roles SCM Asignados:", "• Coordinador de Configuración: Gestión de inventario y líneas base\n• Responsable Técnico: Automatización en Git, Maven y Docker\n• Revisor de Cambios: Control de calidad, Pull Requests y BDD\n• Documentador: Registro técnico, actas y trazabilidad"),
        ("Semestre / Ciclo:", "2026 - I / Período Académico 2026"),
        ("Fecha de Entrega:", "29 de Septiembre de 2026")
    ]
    
    for idx, (label, val) in enumerate(data_portada):
        cell_lbl = card_table.cell(idx, 0)
        cell_val = card_table.cell(idx, 1)
        set_cell_background(cell_lbl, "F8FAFC")
        set_cell_background(cell_val, "FFFFFF")
        set_cell_margins(cell_lbl, top=70, bottom=70, left=90, right=90)
        set_cell_margins(cell_val, top=70, bottom=70, left=90, right=90)
        
        p_l = cell_lbl.paragraphs[0]
        p_l.paragraph_format.space_after = Pt(0)
        r_l = p_l.add_run(label)
        r_l.bold = True
        r_l.font.name = 'Calibri'
        r_l.font.size = Pt(9.5)
        r_l.font.color.rgb = RGBColor(27, 54, 93)
        
        p_v = cell_val.paragraphs[0]
        p_v.paragraph_format.space_after = Pt(0)
        r_v = p_v.add_run(val)
        r_v.font.name = 'Calibri'
        r_v.font.size = Pt(9.5)
        r_v.font.color.rgb = RGBColor(51, 51, 51)
        
    doc.add_page_break()
    
    # =============================================================
    # SECCIÓN 1: INTRODUCCIÓN GENERAL
    # =============================================================
    add_heading_with_spacing(doc, "1. Introducción y Contexto del Proyecto 'Tranki'", level=1)
    
    add_paragraph_styled(doc, 
        "El presente informe desarrolla la Fase 1, la Fase 2 y la Fase 3 de la Evaluación del Consolidado 1.2 correspondiente a la asignatura de Pruebas y Calidad de Software de la Universidad Continental. El propósito fundamental es diseñar e implementar un marco de Gestión de Configuración del Software (Software Configuration Management - SCM) riguroso, formal y aplicable a un sistema transaccional real.",
        bold_prefix="Propósito del Informe: ")
    
    add_paragraph_styled(doc,
        "Tranki es el motor backend transaccional de un sistema integrado de recaudo para transporte público urbano. Su misión es controlar el ciclo de vida de tarjetas inteligentes NFC, procesar débitos y recargas de saldo de forma segura, reconciliar lotes de viajes despachados por validadores físicos embebidos (ESP32) instalados en flotas de buses bajo el paradigma offline-first, y sincronizar listas negras distribuidas para mitigar el fraude y sobregiro financiero.",
        bold_prefix="Descripción del Sistema: ")
        
    add_callout(doc, "Relevancia de la Gestión de Configuración en 'Tranki'",
        "Dado que Tranki maneja transacciones monetarias, conciliación de pasajes de transporte público e interacción asíncrona con dispositivos físicos ESP32, cualquier modificación descontrolada en el modelo de dominio, reglas tarifarias, contratos de API o dependencias puede ocasionar pérdidas financieras, fallos de abordaje en ruta y desincronización de flotas. Por ello, la gestión formal de cambios es un pilar crítico de aseguramiento de calidad (QA).")
        
    add_paragraph_styled(doc,
        "La arquitectura del proyecto está construida bajo Domain-Driven Design (DDD) con Arquitectura Hexagonal (Ports & Adapters), CQRS y Behavior-Driven Development (BDD). La tecnología base está conformada por Java 21 LTS, Spring Boot 3.3.0, Spring Data JPA, PostgreSQL / H2 en memoria, Cucumber-JVM 7.x para pruebas vivas en Gherkin, y Docker Compose para orquestación.",
        bold_prefix="Stack y Arquitectura Base: ")

    doc.add_page_break()

    # =============================================================
    # SECCIÓN 2: FASE 1 - IDENTIFICACIÓN DE LA CONFIGURACIÓN
    # =============================================================
    add_heading_with_spacing(doc, "2. FASE 1: Identificación de la Configuración del Proyecto", level=1)
    
    add_paragraph_styled(doc,
        "La Fase 1 tiene como objetivo delimitar formalmente qué productos de trabajo componen el sistema, su grado de volatilidad y su impacto crítico en la operación.")

    # 2.1 Preguntas orientadoras
    add_heading_with_spacing(doc, "2.1. Análisis y Respuestas a las Preguntas Orientadoras", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "En el proyecto Tranki, se deben controlar todos aquellos productos de trabajo que determinan el comportamiento, la calidad, la integridad y la reproducibilidad del sistema. Específicamente:",
        bold_prefix="¿Qué productos o artefactos deben controlarse? ")
    
    items_p1 = [
        ("Código fuente productivo: ", "Modelos de dominio puro (Account, Card, Trip), casos de uso de aplicación (IssueCardUseCase, RechargeAccountUseCase, ProcessTripBatchUseCase) y adaptadores de infraestructura."),
        ("Especificaciones y requisitos formales: ", "Historias de usuario documentadas en formato Mike Cohn (.specs/features/) y las constituciones de reglas inmutables de dominio."),
        ("Casos de prueba automatizados: ", "Archivos Gherkin (.feature) de especificación BDD y sus clases de pasos Java (*Steps.java)."),
        ("Archivos de configuración y orquestación: ", "application.yml, Dockerfile, docker-compose.yml y metadatos de Git/Maven."),
        ("Definición de dependencias: ", "El archivo pom.xml que fija con precisión las versiones de Java 21, Spring Boot 3.3.0 y Cucumber 7.18.0."),
        ("Artefactos entregables y reportes: ", "Paquetes compilados JAR ejecutables y reportes de ejecución de pruebas generados por Maven Surefire.")
    ]
    for b_txt, n_txt in items_p1:
        p_item = doc.add_paragraph()
        p_item.paragraph_format.left_indent = Inches(0.25)
        p_item.paragraph_format.space_after = Pt(2.5)
        r_b = p_item.add_run("• " + b_txt)
        r_b.bold = True
        r_b.font.name = 'Calibri'
        r_b.font.color.rgb = RGBColor(27, 54, 93)
        r_n = p_item.add_run(n_txt)
        r_n.font.name = 'Calibri'

    add_paragraph_styled(doc,
        "La frecuencia de cambio varía según la etapa del sprint y la naturaleza del artefacto. En Tranki se identifican tres niveles de volatilidad:",
        bold_prefix="¿Qué elementos cambian con frecuencia? ")
        
    items_p2 = [
        ("Alta Frecuencia (Diaria / por Sprint): ", "El código de los casos de uso (application/), controladores REST (in/web/), los escenarios de prueba BDD (.feature) y los Step Definitions. Cada nueva historia de usuario o corrección de bugs incide directamente sobre estos componentes."),
        ("Media Frecuencia (Semanal o por Milestone): ", "Las historias de usuario (.specs/features/*.md), los archivos de configuración local (application.yml) y los scripts de orquestación de Docker/Compose al añadir variables de entorno o afinar perfiles de despliegue."),
        ("Baja Frecuencia (Estables / Inmutables): ", "La constitución de reglas de negocio (domain-rules.md), la arquitectura base (tech-stack.md) y el descriptor de dependencias (pom.xml), los cuales solo se modifican bajo decisiones formales de arquitectura o actualizaciones de seguridad.")
    ]
    for b_txt, n_txt in items_p2:
        p_item = doc.add_paragraph()
        p_item.paragraph_format.left_indent = Inches(0.25)
        p_item.paragraph_format.space_after = Pt(2.5)
        r_b = p_item.add_run("• " + b_txt)
        r_b.bold = True
        r_b.font.name = 'Calibri'
        r_b.font.color.rgb = RGBColor(180, 83, 9)
        r_n = p_item.add_run(n_txt)
        r_n.font.name = 'Calibri'

    add_paragraph_styled(doc,
        "Los elementos más críticos son aquellos cuyo fallo o alteración indebida causaría pérdidas financieras, bloqueos del servicio de transporte en campo o imposibilidad de compilar y desplegar:",
        bold_prefix="¿Cuáles son críticos para el funcionamiento del sistema? ")
        
    items_p3 = [
        ("Lógica Central de Cuentas y Saldos (Account.java / Money.java): ", "Garantiza la consistencia matemática inmutable de los balances y el respeto del límite de crédito de emergencia (debtMarginLimit = -S/ 3.00). Un error aquí generaría pérdidas contables irreversibles."),
        ("Procesamiento Idempotente de Lotes de Viajes (ProcessTripBatchUseCase.java): ", "Permite procesar viajes cobrados offline por validadores ESP32 sin duplicar cobros ante fallas y reenvíos de red."),
        ("Gestión de Recargas Idempotentes (RechargeAccountUseCase.java): ", "Garantiza que una recarga financiera externa no se acredite dos veces y desbloquee tarjetas con deuda."),
        ("Descriptor de Dependencias (pom.xml) y Docker Compose: ", "Garantizan la reproducibilidad del entorno. Si se desalinea una versión de librería, el backend dejará de iniciar o fallará en producción."),
        ("Constitución de Dominio (.specs/constitution/domain-rules.md): ", "Es la única fuente de verdad autoritativa para el equipo y agentes de IA. Previene desviaciones conceptuales entre negocio y código.")
    ]
    for b_txt, n_txt in items_p3:
        p_item = doc.add_paragraph()
        p_item.paragraph_format.left_indent = Inches(0.25)
        p_item.paragraph_format.space_after = Pt(2.5)
        r_b = p_item.add_run("• " + b_txt)
        r_b.bold = True
        r_b.font.name = 'Calibri'
        r_b.font.color.rgb = RGBColor(185, 28, 28)
        r_n = p_item.add_run(n_txt)
        r_n.font.name = 'Calibri'

    # 2.2 Tabla de elementos
    doc.add_page_break()
    add_heading_with_spacing(doc, "2.2. Tabla de Elementos de Configuración del Software (SCI Inventory)", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "La siguiente tabla consolida los veinticuatro (24) Elementos de Configuración del Software (SCI) del proyecto, agrupados rigurosamente en las ocho (8) categorías requeridas por el consolidado:")

    table_data = [
        ("Código Fuente\n(Dominio)", "Entidades puras y Value Objects inmutables (Account, Card, Trip, Money, eventos). Lógica central de negocio aislada.", "Responsable Técnico", "src/main/java/com/tranki/backend/*/domain/", "Media", "Crítico"),
        ("Código Fuente\n(Aplicación)", "Casos de uso del sistema (IssueCardUseCase, RechargeAccountUseCase, ProcessTripBatchUseCase, etc.).", "Responsable Técnico", "src/main/java/com/tranki/backend/*/application/", "Alta", "Crítico"),
        ("Código Fuente\n(Adaptadores)", "Controladores REST (/cards, /accounts, /trips) y adaptadores de persistencia JPA (Repositories y Mappers).", "Responsable Técnico", "src/main/java/com/tranki/backend/*/adapter/", "Alta", "Alto"),
        ("Código Fuente\n(Entrypoint)", "Clase principal de arranque de Spring Boot y configuración global del contexto de la aplicación.", "Responsable Técnico", "src/main/java/com/tranki/backend/TrankiApplication.java", "Baja", "Crítico"),
        ("Documentación Técnica\n(Reglas de Dominio)", "Constitución inmutable del negocio: agregados, invariantes, estados de tarjetas, tarifas y traducción de campos.", "Coordinador de Configuración", ".specs/constitution/domain-rules.md", "Baja", "Crítico"),
        ("Documentación Técnica\n(Stack y Arquitectura)", "Definición de arquitectura Hexagonal, convenciones Java 21, estándares REST y directrices de testing.", "Coordinador de Configuración", ".specs/constitution/tech-stack.md", "Baja", "Alto"),
        ("Documentación Técnica\n(Guía para Agentes)", "Instrucciones de desarrollo Spec-Driven (SDD) para desarrolladores y asistentes IA.", "Documentador", "AGENT.md", "Media", "Medio"),
        ("Documentación Técnica\n(README General)", "Manual de inducción, pre-requisitos de ejecución local/Docker, comandos y ejemplos de API con curl.", "Documentador", "README.md", "Media", "Alto"),
        ("Requisitos\n(Historias de Tarjeta)", "Historias de usuario formales Mike Cohn: emisión (US-01), tarifas (US-02), configuración (US-03) y bloqueos (US-04, 05).", "Coordinador de Configuración", ".specs/features/tarjeta/US-*.md", "Media", "Alto"),
        ("Requisitos\n(Historias de Cuenta)", "Historias de usuario: recargas idempotentes (US-06), transferencias (US-07) y consulta de movimientos (US-08).", "Coordinador de Configuración", ".specs/features/cuenta/US-*.md", "Media", "Crítico"),
        ("Requisitos\n(Historias de Viaje/Validador)", "Historias de abordaje offline en ESP32 (US-09), lotes de viajes (US-10) y sincronización de lista negra (US-11).", "Coordinador de Configuración", ".specs/features/{viaje,validador,listanegra}/US-*.md", "Media", "Crítico"),
        ("Casos de Prueba\n(Escenarios Gherkin)", "Especificaciones ejecutables BDD en formato Gherkin (.feature) en español con identificación formal de campos.", "Revisor de Cambios", "src/test/resources/features/*/*.feature", "Alta", "Crítico"),
        ("Casos de Prueba\n(Step Definitions)", "Clases Java de enlace Cucumber (*Steps.java) que ejecutan aserciones y manipulan repositorios de prueba.", "Revisor de Cambios", "src/test/java/com/tranki/backend/*Steps.java", "Alta", "Crítico"),
        ("Casos de Prueba\n(Configuración Runner)", "Suite de pruebas JUnit 5 y configuración del contexto Spring Boot de pruebas (@RecordApplicationEvents).", "Responsable Técnico", "src/test/java/com/tranki/backend/CucumberTest*.java", "Baja", "Alto"),
        ("Casos de Prueba\n(Reportes Surefire)", "Reportes XML y resúmenes de texto generados tras la ejecución de las 45 pruebas automatizadas.", "Documentador", "target/surefire-reports/", "Alta (Auto)", "Medio"),
        ("Archivos de Configuración\n(Spring Boot)", "Configuración de conexión H2 / PostgreSQL, Hibernate DDL, logging y puerto 8080 del servidor.", "Responsable Técnico", "src/main/resources/application.yml", "Media", "Crítico"),
        ("Archivos de Configuración\n(Docker & Compose)", "Definición del contenedor multi-etapa y orquestación con la base de datos PostgreSQL 16.", "Responsable Técnico", "Dockerfile, docker-compose.yml, .dockerignore", "Baja", "Alto"),
        ("Archivos de Configuración\n(Control de Versiones)", "Reglas de exclusión de binarios, archivos temporales y reportes locales en el repositorio Git.", "Coordinador de Configuración", ".gitignore", "Baja", "Medio"),
        ("Dependencias\n(Maven POM)", "Descriptor Maven de dependencias de producción (Spring Boot, JPA, Postgres) y testing (Cucumber, AssertJ).", "Responsable Técnico", "pom.xml", "Baja", "Crítico"),
        ("Dependencias\n(Maven Wrapper)", "Binarios y propiedades del motor Maven Wrapper 3.9.9 para garantizar compilación uniforme en cualquier SO.", "Responsable Técnico", ".mvn/wrapper/, mvnw, mvnw.cmd", "Baja", "Alto"),
        ("Base de Datos\n(Entidades JPA)", "Mapeos relacionales ORM desacoplados del dominio (AccountJpaEntity, CardJpaEntity, TripJpaEntity) con esquemas DDL automáticos.", "Responsable Técnico", "src/main/java/com/tranki/backend/*/adapter/out/persistence/", "Media", "Crítico"),
        ("Base de Datos\n(Soft Foreign Keys)", "Referencias por identidad entre tablas derivadas de Agregados DDD (cards.account_id, accounts.user_id, trips.card_id/account_id) sin constraints SQL rígidos.", "Responsable Técnico", "Entidades JPA / Modelos de Persistencia", "Baja", "Crítico"),
        ("Base de Datos\n(Persistencia Docker)", "Volumen persistente de base de datos PostgreSQL tranki_pgdata para conservar datos transaccionales entre reinicios.", "Responsable Técnico", "docker-compose.yml (Volume tranki_pgdata)", "Baja", "Alto"),
        ("Entregables\n(Binario Ejecutable)", "Archivo empaquetado ejecutable JAR autocontenido (tranki-backend-0.0.1-SNAPSHOT.jar).", "Responsable Técnico", "target/*.jar", "Alta (Build)", "Crítico"),
        ("Manuales\n(Guía de Operación)", "Documentación operativa de despliegue, APIs REST y procedimientos de troubleshooting.", "Documentador", "README.md, .specs/constitution/", "Media", "Alto")
    ]
    
    table = doc.add_table(rows=len(table_data) + 1, cols=6)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    col_widths = [Inches(1.1), Inches(1.8), Inches(1.1), Inches(1.3), Inches(0.6), Inches(0.6)]
    for row in table.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = width

    headers = ["Elemento (SCI)", "Descripción", "Responsable", "Ubicación", "Frecuencia", "Criticidad"]
    hdr_cells = table.rows[0].cells
    for idx, text in enumerate(headers):
        set_cell_background(hdr_cells[idx], "1B365D")
        set_cell_margins(hdr_cells[idx], top=100, bottom=100, left=60, right=60)
        p = hdr_cells[idx].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(text)
        r.bold = True
        r.font.name = 'Calibri'
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    for row_idx, data_row in enumerate(table_data):
        row_cells = table.rows[row_idx + 1].cells
        bg_col = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
        
        for col_idx, cell_value in enumerate(data_row):
            cell = row_cells[col_idx]
            set_cell_background(cell, bg_col)
            set_cell_margins(cell, top=70, bottom=70, left=50, right=50)
            
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            
            if col_idx in [4, 5]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                
            r = p.add_run(cell_value)
            r.font.name = 'Calibri'
            r.font.size = Pt(8.5)
            
            if col_idx == 5:
                r.bold = True
                if cell_value == "Crítico":
                    r.font.color.rgb = RGBColor(185, 28, 28)
                elif cell_value == "Alto":
                    r.font.color.rgb = RGBColor(194, 65, 12)
                else:
                    r.font.color.rgb = RGBColor(21, 128, 61)
            elif col_idx == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(27, 54, 93)
            else:
                r.font.color.rgb = RGBColor(51, 51, 51)
                
    # 2.3 Soft Foreign Keys
    add_heading_with_spacing(doc, "2.3. Arquitectura de Base de Datos DDD: Referencias por Identidad (Soft Foreign Keys)", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "Una decisión de configuración vital en Tranki surge de la regla de Agregados en Domain-Driven Design (DDD): 'Referencia entre Agregados exclusivamente por Identidad' (Reference by Identity). En lugar de crear acoplamientos rígidos con claves foráneas duras en SQL o anotaciones @ManyToOne en JPA, el sistema implementa Soft Foreign Keys (claves foráneas lógicas por UUID o String).",
        bold_prefix="Fundamento Teórico DDD: ")

    add_callout(doc, "Regla de Agregados en DDD (Eric Evans & Vaughn Vernon)",
        "Los Agregados representan límites transaccionales independientes. Para evitar que las transacciones y los ciclos de vida de entidades se acoplen, ningún agregado debe contener referencias directas a objetos de otro agregado. En su lugar, se hace referencia a otros agregados únicamente a través de su identidad global (ID).")

    add_paragraph_styled(doc,
        "Al examinar las entidades de persistencia en el repositorio (adapter/out/persistence/), se evidencian claramente estas referencias por identidad desacopladas:",
        bold_prefix="Evidencias en las Entidades del Proyecto: ")

    items_soft_fk = [
        ("Entidad 'CardJpaEntity' (Tabla 'cards'): ", "Almacena los campos 'private UUID accountId;' y 'private UUID kioskAgentId;' como valores primitivos planos. No existe ninguna relación JPA de navegación tipo '@ManyToOne private AccountJpaEntity account;' ni constraints 'FOREIGN KEY ... REFERENCES accounts(account_id)'. La tarjeta solo conoce el UUID de su cuenta."),
        ("Entidad 'AccountJpaEntity' (Tabla 'accounts'): ", "Almacena 'private UUID userId;' (campo nullable). Permite que la cuenta exista en modo anónimo (adquirida en kiosco sin registro de usuario) sin violar restricciones de integridad referencial SQL en la base de datos."),
        ("Entidad 'TripJpaEntity' (Tabla 'trips'): ", "Almacena 'private String cardId;' y 'private UUID accountId;' de forma totalmente plana y atómica. Esto es indispensable para el procesamiento de lotes de viajes (Batch Processing) provenientes de los buses ESP32 offline, permitiendo insertar viajes sin bloquear las tablas de tarjetas o cuentas."),
        ("Entidad 'RechargeTransaction' (Tabla 'recharge_transactions'): ", "Almacena 'private UUID accountId;' para garantizar idempotencia por 'transactionId' sin acoplamiento relacional en cascada.")
    ]
    for b_txt, n_txt in items_soft_fk:
        p_item = doc.add_paragraph()
        p_item.paragraph_format.left_indent = Inches(0.25)
        p_item.paragraph_format.space_after = Pt(2.5)
        r_b = p_item.add_run("• " + b_txt)
        r_b.bold = True
        r_b.font.name = 'Calibri'
        r_b.font.color.rgb = RGBColor(27, 54, 93)
        r_n = p_item.add_run(n_txt)
        r_n.font.name = 'Calibri'

    # 2.4 Roles del Grupo en SCM
    add_heading_with_spacing(doc, "2.4. Asignación de Roles del Grupo en la Gestión de Configuración", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "Siguiendo estrictamente los cuatro (4) roles sugeridos en la guía académica de la Universidad Continental, el equipo de desarrollo de Tranki reparte sus funciones de la siguiente manera:",
        bold_prefix="Estructura de Responsabilidades: ")
        
    roles_desc = [
        ("Coordinador de Configuración: ", "Organiza el inventario formal de SCIs, audita periódicamente que ningún commit eluda las convenciones de trazabilidad, vela por la estabilidad de las líneas base (baselines) y valida la coherencia entre las reglas de dominio (.specs/constitution/) y los requerimientos aprobados."),
        ("Responsable Técnico: ", "Ejecuta la configuración técnica en las herramientas. Administra el repositorio Git, la configuración del wrapper de Maven (pom.xml), la orquestación de Docker/Compose, la automatización del pipeline de construcción y la resolución de conflictos técnicos de integración."),
        ("Revisor de Cambios: ", "Supervisa y valida el flujo de control de cambios. Revisa los Pull Requests (PRs), audita la calidad de los commits bajo convención Conventional Commits, asegura la cobertura de pruebas BDD en Gherkin y verifica que todo cambio cuente con sus respectivos Step Definitions antes de ser fusionado a ramas principales."),
        ("Documentador: ", "Registra las decisiones de diseño arquitectónico, mantiene actualizado el archivo README.md, documenta las actas de reunión y solicitudes de cambio (RFC / Issues), y gestiona el histórico de reportes de calidad emitidos tras cada corrida de pruebas.")
    ]
    for r_title, r_desc in roles_desc:
        p_role = doc.add_paragraph()
        p_role.paragraph_format.left_indent = Inches(0.2)
        p_role.paragraph_format.space_after = Pt(3)
        r_t = p_role.add_run(r_title)
        r_t.bold = True
        r_t.font.name = 'Calibri'
        r_t.font.color.rgb = RGBColor(27, 54, 93)
        r_d = p_role.add_run(r_desc)
        r_d.font.name = 'Calibri'

    # 2.5 Líneas Base
    add_heading_with_spacing(doc, "2.5. Definición de Líneas Base (Baselines) del Proyecto", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "Para garantizar la estabilidad del software y evitar retrocesos funcionales, se establecen tres (3) líneas base formales para el ciclo de vida de Tranki:",
        bold_prefix="Líneas Base de Configuración: ")

    baselines = [
        ("Línea Base Funcional (BL-01 - Requerimientos y Dominio): ", "Congela las reglas de negocio inmutables (.specs/constitution/domain-rules.md) y las especificaciones iniciales de historias de usuario (US-01 a US-11). Cualquier cambio posterior requiere una solicitud formal."),
        ("Línea Base de Desarrollo (BL-02 - Core BDD Integrado): ", "Marca el hito donde los 45 escenarios BDD de Cucumber se ejecutan en verde (BUILD SUCCESS) sobre la base de datos en memoria H2. Representa un estado estable y validado del núcleo transaccional."),
        ("Línea Base de Despliegue (BL-03 - Containerized Release): ", "Empaqueta el binario JAR en la imagen Docker multi-etapa y fija las dependencias con PostgreSQL 16 a través de docker-compose.yml para entornos de homologación y producción.")
    ]
    for b_title, b_desc in baselines:
        p_base = doc.add_paragraph()
        p_base.paragraph_format.left_indent = Inches(0.2)
        p_base.paragraph_format.space_after = Pt(3)
        r_t = p_base.add_run(b_title)
        r_t.bold = True
        r_t.font.name = 'Calibri'
        r_t.font.color.rgb = RGBColor(180, 83, 9)
        r_d = p_base.add_run(b_desc)
        r_d.font.name = 'Calibri'

    doc.add_page_break()

    # =============================================================
    # SECCIÓN 3: FASE 2 - DISEÑO DEL PROCESO DE CONTROL DE CAMBIOS
    # =============================================================
    add_heading_with_spacing(doc, "3. FASE 2: Diseño del Proceso de Control de Cambios", level=1)
    
    add_paragraph_styled(doc,
        "La Fase 2 establece el marco metodológico y las políticas formales bajo las cuales se gestionan, evalúan y aprueban las modificaciones sobre los Elementos de Configuración (SCI). Esta fase define la lógica conceptual del proceso antes de su materialización en herramientas técnicas.")

    # 3.1 Acuerdos y Políticas
    add_heading_with_spacing(doc, "3.1. Acuerdos y Políticas del Proceso de Control de Cambios", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "En concordancia estricta con los puntos acordados por el equipo, se establecen las siguientes definiciones de gobernanza:",
        bold_prefix="Definiciones de Gobernanza: ")

    gov_points = [
        ("• ¿Quién puede proponer cambios? ", "Cualquier miembro del equipo de desarrollo, el Revisor de Calidad (QA), el Arquitecto de Software o el Product Owner. Los cambios se clasifican formalmente en: (a) Nueva Característica (Feature Request), (b) Corrección de Defecto (Bug Fix), (c) Deuda Técnica / Refactorización de Arquitectura, y (d) Cambio Crítico de Emergencia (Hotfix)."),
        ("• ¿Quién revisa los cambios? ", "El Revisor de Cambios en conjunto con un desarrollador par (Peer Reviewer). La revisión valida la adherencia técnica a la arquitectura hexagonal, la pureza del modelo de dominio y la existencia de pruebas automatizadas."),
        ("• ¿Quién aprueba los cambios? ", "El Coordinador de Configuración (para cambios funcionales de requisitos, tarifas o dependencias de librerías) y el Responsable Técnico (para la aprobación técnica del merge)."),
        ("• ¿Cuándo un cambio se considera aceptado? ", "Un cambio se considera formalmente aceptado bajo el criterio Definition of Done (DoD): (1) 100% de los tests BDD existentes y nuevos pasan en verde, (2) Se cuenta con aprobación formal en la revisión por pares, (3) Cero conflictos de integración con la línea base, y (4) Documentación sincronizada."),
        ("• ¿Cómo se documenta? ", "A través de un registro formal de cambio (Issue/Ticket) que documenta el contexto, la justificación, los componentes afectados y las evidencias de verificación."),
        ("• ¿Cómo se relaciona con requisitos o errores? ", "Mediante un enlace directo de trazabilidad: cada cambio debe citar expresamente el identificador del requisito funcional (US-XX) o el código de error/defecto que motiva la modificación.")
    ]
    for b_title, b_desc in gov_points:
        p_gov = doc.add_paragraph()
        p_gov.paragraph_format.left_indent = Inches(0.2)
        p_gov.paragraph_format.space_after = Pt(3)
        r_t = p_gov.add_run(b_title)
        r_t.bold = True
        r_t.font.name = 'Calibri'
        r_t.font.color.rgb = RGBColor(27, 54, 93)
        r_d = p_gov.add_run(b_desc)
        r_d.font.name = 'Calibri'

    # 3.2 Flujo simple del proceso (8 etapas)
    add_heading_with_spacing(doc, "3.2. Flujo Simple del Proceso de Control de Cambios (8 Etapas)", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "El resultado esperado de la Fase 2 es un flujo estructurado y secuencial que rige desde la concepción de una modificación hasta su absorción en la línea base del sistema:",
        bold_prefix="Etapas del Flujo de Control de Cambios: ")

    flow_table_data = [
        ("1. Se detecta necesidad de cambio", "Identificación de una nueva funcionalidad, fallo en validador físico o ajuste de regla tarifaria.", "Cualquier rol / Stakeholder", "Solicitud inicial de cambio"),
        ("2. Se registra el cambio en issue/ticket", "Documentación formal en la herramienta de seguimiento con título, descripción, tipo y severidad.", "Documentador / Solicitante", "Ticket de cambio registrado"),
        ("3. Se analiza impacto", "Evaluación técnica de viabilidad: afectación sobre el dominio DDD, contratos de API y persistencia.", "Coordinador de Configuración & Responsable Técnico", "Dictamen de aprobación de impacto"),
        ("4. Se asigna responsable", "Asignación del cambio a un desarrollador específico y priorización en el sprint o milestone.", "Coordinador de Configuración", "Asignación formal de tarea"),
        ("5. Se implementa en rama", "Desarrollo en una rama de trabajo aislada aplicando metodología BDD (prueba Gherkin primero).", "Responsable Técnico / Desarrollador", "Código y pruebas implementadas"),
        ("6. Se revisa", "Inspección exhaustiva por pares (Peer Review) validando cumplimiento de reglas de negocio y tests locales.", "Revisor de Cambios", "Revisión técnica conforme"),
        ("7. Se aprueba e integra", "Autorización formal e integración del cambio en la rama de desarrollo mediante Pull Request verificado.", "Responsable Técnico", "Integración exitosa (Merge)"),
        ("8. Se actualiza la documentación", "Actualización de las especificaciones funcionales (.specs/), manuales y cierre formal del ticket.", "Documentador", "Línea base y docs actualizados")
    ]
    
    tbl_flow = doc.add_table(rows=len(flow_table_data) + 1, cols=4)
    tbl_flow.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_flow.autofit = False
    
    flow_widths = [Inches(1.8), Inches(2.3), Inches(1.2), Inches(1.2)]
    for row in tbl_flow.rows:
        for idx, width in enumerate(flow_widths):
            row.cells[idx].width = width

    flow_headers = ["Etapa del Proceso", "Descripción de la Actividad", "Responsable", "Resultado / Evidencia"]
    for idx, text in enumerate(flow_headers):
        cell = tbl_flow.rows[0].cells[idx]
        set_cell_background(cell, "1B365D")
        set_cell_margins(cell, top=80, bottom=80, left=50, right=50)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(text)
        r.bold = True
        r.font.name = 'Calibri'
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    for row_idx, data_row in enumerate(flow_table_data):
        row_cells = tbl_flow.rows[row_idx + 1].cells
        bg_col = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
        
        for col_idx, cell_value in enumerate(data_row):
            cell = row_cells[col_idx]
            set_cell_background(cell, bg_col)
            set_cell_margins(cell, top=60, bottom=60, left=50, right=50)
            
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            
            r = p.add_run(cell_value)
            r.font.name = 'Calibri'
            r.font.size = Pt(8.5)
            
            if col_idx == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(27, 54, 93)
            else:
                r.font.color.rgb = RGBColor(51, 51, 51)

    doc.add_page_break()

    # =============================================================
    # SECCIÓN 4: FASE 3 - IMPLEMENTACIÓN CON HERRAMIENTA DE CONFIGURACIÓN
    # =============================================================
    add_heading_with_spacing(doc, "4. FASE 3: Implementación con Herramienta de Configuración", level=1)
    
    add_paragraph_styled(doc,
        "La Fase 3 traslada el diseño conceptual de la Fase 2 a una herramienta real de control de versiones y colaboración. A continuación se detalla la configuración técnica formal implementada para el proyecto Tranki.")

    # 4.1 Herramientas seleccionadas
    add_heading_with_spacing(doc, "4.1. Plataforma y Herramientas Seleccionadas", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "El equipo ha adoptado el siguiente ecosistema de herramientas de configuración:",
        bold_prefix="Ecosistema de SCM: ")

    tools_list = [
        ("Sistema de Control de Versiones: Git. ", "Gestiona el historial inmutable de cambios de forma distribuida mediante firmas criptográficas SHA-1/SHA-256 para cada commit."),
        ("Plataforma Colaborativa: GitHub (jmletts/tranqi-backend). ", "Aloja el repositorio remoto central, gestiona los accesos, la protección de ramas principales y la revisión de código por pares mediante Pull Requests."),
        ("Seguimiento y Visualización: GitHub Projects & Issues. ", "Tablero Kanban integrado para gestionar el ciclo de vida de los cambios (Backlog → To Do → In Progress → Review → Done).")
    ]
    for b_title, b_desc in tools_list:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.left_indent = Inches(0.2)
        p_t.paragraph_format.space_after = Pt(2.5)
        r_t = p_t.add_run("• " + b_title)
        r_t.bold = True
        r_t.font.name = 'Calibri'
        r_t.font.color.rgb = RGBColor(27, 54, 93)
        r_d = p_t.add_run(b_desc)
        r_d.font.name = 'Calibri'

    # 4.2 Configuración del Repositorio y Ramas
    add_heading_with_spacing(doc, "4.2. Configuración de Repositorio y Estrategia de Ramas", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "En cumplimiento de los requisitos mínimos exigidos por la guía académica, el repositorio cuenta con la siguiente arquitectura de ramificación:",
        bold_prefix="Topología de Ramas Oficial: ")

    branches_config = [
        ("1. Rama Principal ('main'): ", "Representa la versión estable y lista para producción. Ningún desarrollador puede realizar commits directos sobre ella. Solo recibe fusiones mediante Pull Request previamente aprobado y verificado."),
        ("2. Rama de Desarrollo ('develop'): ", "Rama de integración continua donde convergen las nuevas funcionalidades terminadas. Es el punto de partida para todas las ramas de trabajo y el entorno base de homologación técnica."),
        ("3. Ramas por Funcionalidad ('feature/...'): ", "Ramas temporales creadas para implementar una historia de usuario o requerimiento específico. Nacen de 'develop' y se fusionan de regreso a 'develop' tras superar las pruebas BDD."),
        ("4. Ramas de Corrección ('fix/...'): ", "Ramas de mantenimiento para resolver errores detectados durante el ciclo de pruebas."),
        ("5. Ramas de Emergencia ('hotfix/...'): ", "Ramas críticas derivadas de 'main' para corregir incidencias graves en producción, sincronizándose simultáneamente hacia 'main' y 'develop'.")
    ]
    for b_title, b_desc in branches_config:
        p_br = doc.add_paragraph()
        p_br.paragraph_format.left_indent = Inches(0.2)
        p_br.paragraph_format.space_after = Pt(3)
        r_t = p_br.add_run(b_title)
        r_t.bold = True
        r_t.font.name = 'Calibri'
        r_t.font.color.rgb = RGBColor(27, 54, 93)
        r_d = p_br.add_run(b_desc)
        r_d.font.name = 'Calibri'

    # 4.3 Reglas de nombres para ramas
    add_heading_with_spacing(doc, "4.3. Reglas de Nomenclatura para Ramas", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "Se establece un formato estricto en minúsculas (kebab-case) con prefijo de categoría y referencia al identificador del requisito:",
        bold_prefix="Convención de Ramas: ")

    branch_rules = [
        ("feature/us-xx-descripcion-corta", "Para desarrollo de historias de usuario. Ejemplos reales del proyecto Tranki:", [
            "feature/us-01-emitir-tarjeta",
            "feature/us-06-confirmar-recarga",
            "feature/us-10-procesar-lote-viajes"
        ]),
        ("fix/error-descripcion-corta", "Para corrección de defectos o errores de validación:", [
            "fix/error-sobregiro-deuda",
            "fix/idempotencia-recarga-kiosco"
        ]),
        ("hotfix/incidencia-critica", "Para parches urgentes de producción:", [
            "hotfix/bloqueo-inmediato-fraude"
        ])
    ]
    for b_patt, b_desc, b_examples in branch_rules:
        p_r = doc.add_paragraph()
        p_r.paragraph_format.left_indent = Inches(0.2)
        p_r.paragraph_format.space_after = Pt(2)
        r_p = p_r.add_run("• Patrón: " + b_patt + " → ")
        r_p.bold = True
        r_p.font.name = 'Consolas'
        r_p.font.size = Pt(9.5)
        r_p.font.color.rgb = RGBColor(180, 83, 9)
        r_d = p_r.add_run(b_desc)
        r_d.font.name = 'Calibri'
        
        for ex in b_examples:
            p_ex = doc.add_paragraph()
            p_ex.paragraph_format.left_indent = Inches(0.4)
            p_ex.paragraph_format.space_after = Pt(1)
            r_ex = p_ex.add_run("  ↳ " + ex)
            r_ex.font.name = 'Consolas'
            r_ex.font.size = Pt(9)
            r_ex.font.color.rgb = RGBColor(71, 85, 105)

    # 4.4 Mensajes de commit claros
    add_heading_with_spacing(doc, "4.4. Estándar de Mensajes de Commit Claros (Conventional Commits)", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "Los mensajes de commit deben describir con precisión la intención técnica del cambio, indicando el tipo, el módulo afectado y el identificador del issue:",
        bold_prefix="Estructura de Commit: ")
        
    p_format = doc.add_paragraph()
    p_format.paragraph_format.left_indent = Inches(0.25)
    p_format.paragraph_format.space_after = Pt(4)
    r_fmt = p_format.add_run("<tipo>(<módulo>): <descripción concisa en modo imperativo> (#<issue>)")
    r_fmt.bold = True
    r_fmt.font.name = 'Consolas'
    r_fmt.font.size = Pt(10)
    r_fmt.font.color.rgb = RGBColor(27, 54, 93)

    commits_table = [
        ("feat(tarjeta): implementar emision en kiosco (#01)", "Nueva funcionalidad en el módulo tarjeta vinculada al Issue #01."),
        ("feat(viaje): US-10 sincronizacion lote de viajes (#10)", "Commit real del repositorio para la ingesta batch de buses."),
        ("fix(cuenta): verificar limite de deuda en recargas (#06)", "Corrección de validación financiera en el agregado Account."),
        ("test(cuenta): agregar escenarios gherkin de saldo negativo", "Incorporación de nuevas pruebas BDD en Cucumber."),
        ("docs: add comprehensive README.md", "Commit real del repositorio para actualización de manual de despliegue.")
    ]
    for c_msg, c_expl in commits_table:
        p_c = doc.add_paragraph()
        p_c.paragraph_format.left_indent = Inches(0.2)
        p_c.paragraph_format.space_after = Pt(2)
        r_cm = p_c.add_run("• " + c_msg + "\n  ")
        r_cm.bold = True
        r_cm.font.name = 'Consolas'
        r_cm.font.size = Pt(9)
        r_cm.font.color.rgb = RGBColor(30, 41, 59)
        r_cx = p_c.add_run("Propósito: " + c_expl)
        r_cx.font.name = 'Calibri'
        r_cx.font.size = Pt(9.5)
        r_cx.font.color.rgb = RGBColor(100, 116, 139)

    # 4.5 Registro de Issue en GitHub
    add_heading_with_spacing(doc, "4.5. Registro de Issue o Solicitud de Cambio en la Plataforma", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "En GitHub Issues, cada solicitud de cambio se estructura mediante plantillas estandarizadas que exigen los siguientes campos obligatorios:",
        bold_prefix="Estructura de Ticket: ")

    issue_fields = [
        ("Título descriptivo: ", "Debe contener el prefijo [FEATURE] o [BUG] y el módulo (ej: [FEATURE][VIAJE] Ingesta asíncrona de lotes de pasajes)."),
        ("Descripción y Justificación: ", "Contexto operativo de por qué se requiere la modificación."),
        ("Historias de Usuario / Criterios de Aceptación: ", "Cita de la US de referencia (.specs/features/) y criterios en formato Given-When-Then."),
        ("Elementos de Configuración Afectados: ", "Lista explícita de archivos SCIs que serán modificados (código, .feature, application.yml, etc.)."),
        ("Etiquetas (Labels): ", "Categorización por tipo ('type:feature', 'type:bug'), prioridad ('priority:critical', 'priority:normal') y módulo ('module:account', 'module:trip').")
    ]
    for b_title, b_desc in issue_fields:
        p_iss = doc.add_paragraph()
        p_iss.paragraph_format.left_indent = Inches(0.2)
        p_iss.paragraph_format.space_after = Pt(2.5)
        r_t = p_iss.add_run("• " + b_title)
        r_t.bold = True
        r_t.font.name = 'Calibri'
        r_t.font.color.rgb = RGBColor(27, 54, 93)
        r_d = p_iss.add_run(b_desc)
        r_d.font.name = 'Calibri'

    # 4.6 Matriz de Trazabilidad
    doc.add_page_break()
    add_heading_with_spacing(doc, "4.6. Matriz de Trazabilidad Real en la Herramienta de Configuración", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "Para evidenciar la conexión completa entre requisitos, issues, ramas, commits y pruebas en el repositorio de Tranki, se presenta la siguiente matriz:")

    trazabilidad_data = [
        ("Requisito Funcional (US)", "US-01 (Emisión)", "US-06 (Confirmar Recarga)", "US-10 (Lote de Viajes)", "BUG-04 (Desbloqueo Saldo)"),
        ("GitHub Issue ID", "Issue #1: Emisión Kiosco", "Issue #6: Recarga Idempotente", "Issue #10: Sync Lotes Offline", "Issue #24: Bug Desbloqueo Deuda"),
        ("Rama Git Creada", "feature/us-01-emitir-tarjeta", "feature/us-06-confirmar-recarga", "feature/us-10-procesar-lote-viajes", "fix/issue-24-desbloqueo-saldo"),
        ("Commit Representativo", "feat(tarjeta): issue card (#1)", "feat(cuenta): recharge logic (#6)", "feat(viaje): batch sync (#10)", "fix(cuenta): unlock condition (#24)"),
        ("Prueba BDD Asociada", "emitir_tarjeta.feature", "confirmar_recarga.feature", "procesar_lote_viajes.feature", "confirmar_recarga.feature (Esc. 2)"),
        ("Pull Request (PR)", "PR #1 → develop", "PR #6 → develop", "PR #10 → develop", "PR #25 → develop"),
        ("Línea Base Afectada", "Baseline BL-01 / BL-02", "Baseline BL-02", "Baseline BL-02", "Baseline BL-02 (Parche v1.0.1)")
    ]

    tbl_traz = doc.add_table(rows=len(trazabilidad_data), cols=5)
    tbl_traz.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_traz.autofit = False
    
    traz_widths = [Inches(1.8), Inches(1.1), Inches(1.2), Inches(1.2), Inches(1.2)]
    for row in tbl_traz.rows:
        for idx, width in enumerate(traz_widths):
            row.cells[idx].width = width

    for row_idx, data_row in enumerate(trazabilidad_data):
        row_cells = tbl_traz.rows[row_idx].cells
        bg_col = "1B365D" if row_idx == 0 else ("FFFFFF" if row_idx % 2 == 1 else "F8FAFC")
        
        for col_idx, cell_value in enumerate(data_row):
            cell = row_cells[col_idx]
            set_cell_background(cell, bg_col)
            set_cell_margins(cell, top=60, bottom=60, left=50, right=50)
            
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            
            r = p.add_run(cell_value)
            r.font.name = 'Calibri'
            r.font.size = Pt(8.5)
            
            if row_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                r.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
            elif col_idx == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(27, 54, 93)
            else:
                r.font.color.rgb = RGBColor(51, 51, 51)

    # =============================================================
    # SECCIÓN 5: CONCLUSIONES GENERALES
    # =============================================================
    doc.add_page_break()
    add_heading_with_spacing(doc, "5. Conclusiones y Beneficios para el Proyecto", level=1)
    
    conclusiones = [
        "Fase 1 (Identificación): Se inventariaron con precisión los 24 Elementos de Configuración en las 8 categorías requeridas, destacando el desacoplamiento de base de datos logrado mediante las Soft Foreign Keys de Domain-Driven Design.",
        "Fase 2 (Diseño del Proceso): Se estableció un flujo conceptual de 8 etapas con roles de gobernanza definidos, asegurando que ninguna modificación ingrese al sistema sin análisis de impacto y criterios de aceptación verificables.",
        "Fase 3 (Implementación en Herramienta): Se configuró la herramienta real (Git y GitHub) con ramas protegidas (main y develop), ramas por funcionalidad (feature/us-xx), convención Conventional Commits y trazabilidad bidireccional mediante Issues y Pull Requests.",
        "Aseguramiento de Calidad Integral: La combinación de BDD (45 pruebas Cucumber en verde) con SCM garantiza que el software mantenga su estabilidad financiera y operativa frente a cualquier cambio futuro."
    ]
    for c_text in conclusiones:
        p_c = doc.add_paragraph()
        p_c.paragraph_format.left_indent = Inches(0.2)
        p_c.paragraph_format.space_after = Pt(4)
        r_bullet = p_c.add_run("✔ ")
        r_bullet.bold = True
        r_bullet.font.color.rgb = RGBColor(21, 128, 61)
        r_txt = p_c.add_run(c_text)
        r_txt.font.name = 'Calibri'

    # Save to desktop
    desktop_path = r"C:\Users\eliak\OneDrive\Desktop"
    output_path = os.path.join(desktop_path, "Gestion_Configuracion_Tranki_Fases_1_2_3.docx")
    doc.save(output_path)
    
    # Also overwrite the original file on Desktop so user can access it immediately
    output_original = os.path.join(desktop_path, "Fase_1_Gestion_Configuracion_Tranki.docx")
    doc.save(output_original)
    
    print(f"Generated successfully: {output_path}")
    print(f"Updated original file: {output_original}")
    return output_path

if __name__ == "__main__":
    build_complete_document()
