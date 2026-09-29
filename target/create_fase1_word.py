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

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for margin_name, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(margin_name)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_heading_with_spacing(doc, text, level, space_before=14, space_after=6, color_rgb=(27, 54, 93)):
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
        r_bold.font.color.rgb = RGBColor(30, 41, 59)
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
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
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
    r_title.font.size = Pt(11)
    r_title.font.color.rgb = RGBColor(27, 54, 93)
    
    r_text = p.add_run(text)
    r_text.font.name = 'Calibri'
    r_text.font.size = Pt(10.5)
    r_text.font.color.rgb = RGBColor(55, 65, 81)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(6)

def create_document():
    doc = docx.Document()
    
    # Page Setup (Margins 1 inch)
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
    
    # -------------------------------------------------------------
    # PORTADA
    # -------------------------------------------------------------
    p_uni = doc.add_paragraph()
    p_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_uni.paragraph_format.space_before = Pt(30)
    p_uni.paragraph_format.space_after = Pt(4)
    r_uni = p_uni.add_run("UNIVERSIDAD CONTINENTAL")
    r_uni.bold = True
    r_uni.font.name = 'Calibri'
    r_uni.font.size = Pt(20)
    r_uni.font.color.rgb = RGBColor(27, 54, 93) # Navy Blue
    
    p_fac = doc.add_paragraph()
    p_fac.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_fac.paragraph_format.space_after = Pt(24)
    r_fac = p_fac.add_run("FACULTAD DE INGENIERÍA\nCARRERA PROFESIONAL DE INGENIERÍA DE SISTEMAS E INFORMÁTICA")
    r_fac.bold = True
    r_fac.font.name = 'Calibri'
    r_fac.font.size = Pt(12)
    r_fac.font.color.rgb = RGBColor(71, 85, 105)
    
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line.paragraph_format.space_after = Pt(28)
    r_line = p_line.add_run("____________________________________________________________")
    r_line.font.color.rgb = RGBColor(197, 155, 39) # Gold Accent
    
    p_eval = doc.add_paragraph()
    p_eval.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_eval.paragraph_format.space_after = Pt(8)
    r_eval = p_eval.add_run("EVALUACIÓN DEL CONSOLIDADO 1.2")
    r_eval.bold = True
    r_eval.font.name = 'Calibri'
    r_eval.font.size = Pt(14)
    r_eval.font.color.rgb = RGBColor(180, 83, 9) # Amber
    
    p_course = doc.add_paragraph()
    p_course.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_course.paragraph_format.space_after = Pt(20)
    r_course = p_course.add_run("PRUEBAS Y CALIDAD DE SOFTWARE")
    r_course.bold = True
    r_course.font.name = 'Calibri'
    r_course.font.size = Pt(18)
    r_course.font.color.rgb = RGBColor(27, 54, 93)
    
    p_topic = doc.add_paragraph()
    p_topic.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_topic.paragraph_format.space_after = Pt(36)
    r_topic = p_topic.add_run("Diseño e Implementación Básica de Gestión de Configuración del Software (SCM)\nFASE 1: Identificación de la Configuración del Proyecto")
    r_topic.font.name = 'Calibri'
    r_topic.font.size = Pt(13)
    r_topic.font.italic = True
    r_topic.font.color.rgb = RGBColor(51, 65, 85)
    
    # Project card table on cover
    p_info = doc.add_paragraph()
    p_info.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_info.paragraph_format.space_before = Pt(20)
    p_info.paragraph_format.space_after = Pt(4)
    
    card_table = doc.add_table(rows=5, cols=2)
    card_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    card_table.autofit = False
    card_table.columns[0].width = Inches(2.3)
    card_table.columns[1].width = Inches(4.2)
    
    data_portada = [
        ("Proyecto Analizado:", "Tranki - Backend Central de Recaudo de Transporte Público"),
        ("Repositorio:", "jmletts/tranqi-backend (Java 21 / Spring Boot 3 / Cucumber)"),
        ("Roles SCM Asignados:", "• Coordinador de Configuración: Gestión de inventario y líneas base\n• Responsable Técnico: Automatización y herramientas Git/Maven\n• Revisor de Cambios: Control de calidad, ramas y Pull Requests\n• Documentador: Registro técnico y trazabilidad de artefactos"),
        ("Semestre / Ciclo:", "2026 - I / Período Académico 2026"),
        ("Fecha de Entrega:", "29 de Septiembre de 2026")
    ]
    
    for idx, (label, val) in enumerate(data_portada):
        cell_lbl = card_table.cell(idx, 0)
        cell_val = card_table.cell(idx, 1)
        
        set_cell_background(cell_lbl, "F8FAFC")
        set_cell_background(cell_val, "FFFFFF")
        set_cell_margins(cell_lbl, top=80, bottom=80, left=100, right=100)
        set_cell_margins(cell_val, top=80, bottom=80, left=100, right=100)
        
        p_l = cell_lbl.paragraphs[0]
        p_l.paragraph_format.space_after = Pt(0)
        r_l = p_l.add_run(label)
        r_l.bold = True
        r_l.font.name = 'Calibri'
        r_l.font.size = Pt(10)
        r_l.font.color.rgb = RGBColor(27, 54, 93)
        
        p_v = cell_val.paragraphs[0]
        p_v.paragraph_format.space_after = Pt(0)
        r_v = p_v.add_run(val)
        r_v.font.name = 'Calibri'
        r_v.font.size = Pt(10)
        r_v.font.color.rgb = RGBColor(51, 51, 51)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # INTRODUCCIÓN AL PROYECTO
    # -------------------------------------------------------------
    add_heading_with_spacing(doc, "1. Introducción y Contexto del Proyecto 'Tranki'", level=1)
    
    add_paragraph_styled(doc, 
        "El presente informe desarrolla la Fase 1 de la Evaluación del Consolidado 1.2 correspondiente a la asignatura de Pruebas y Calidad de Software de la Universidad Continental. El objetivo primordial es aplicar los fundamentos teóricos y prácticos de la Gestión de Configuración del Software (Software Configuration Management - SCM) sobre un sistema de software real en fase de desarrollo.",
        bold_prefix="Propósito del Informe: ")
    
    add_paragraph_styled(doc,
        "Tranki es el motor backend transaccional de un sistema integrado de recaudo para transporte público urbano. Su misión es controlar el ciclo de vida de tarjetas inteligentes NFC, procesar débitos y recargas de saldo de forma segura, reconciliar lotes de viajes despachados por validadores físicos embebidos (ESP32) instalados en flotas de buses bajo el paradigma offline-first, y sincronizar listas negras distribuidas para mitigar el fraude y sobregiro financiero.",
        bold_prefix="Descripción del Sistema: ")
        
    add_callout(doc, "Relevancia de la Gestión de Configuración en 'Tranki'",
        "Dado que Tranki maneja transacciones monetarias, conciliación de pasajes de transporte público e interacción asíncrona con dispositivos físicos ESP32, cualquier modificación descontrolada en el modelo de dominio, reglas tarifarias, contratos de API o dependencias puede ocasionar pérdidas financieras, fallos de abordaje en ruta y desincronización de flotas. Por ello, la identificación y control riguroso de cada elemento de configuración es un pilar crítico de aseguramiento de calidad (QA).")
        
    add_paragraph_styled(doc,
        "La arquitectura del proyecto está construida bajo Domain-Driven Design (DDD) con Arquitectura Hexagonal (Ports & Adapters), CQRS y Behavior-Driven Development (BDD). La tecnología base está conformada por Java 21 LTS, Spring Boot 3.3.0, Spring Data JPA, PostgreSQL / H2 en memoria, Cucumber-JVM 7.x para pruebas vivas en Gherkin, y Docker Compose para orquestación.",
        bold_prefix="Stack y Arquitectura Base: ")

    # -------------------------------------------------------------
    # FASE 1: IDENTIFICACIÓN DE LA CONFIGURACIÓN
    # -------------------------------------------------------------
    add_heading_with_spacing(doc, "2. Fase 1: Identificación de la Configuración del Proyecto", level=1)
    
    add_paragraph_styled(doc,
        "La Identificación de la Configuración es la actividad fundacional de la Gestión de Configuración del Software (SCM). Consiste en seleccionar, estructurar y categorizar todos los artefactos de trabajo generados a lo largo del ciclo de vida del software que deben colocarse bajo control formal de versiones y cambios.")

    # 2.1 Preguntas Orientadoras
    add_heading_with_spacing(doc, "2.1. Análisis y Respuestas a las Preguntas Orientadoras", level=2, color_rgb=(41, 70, 115))
    
    # Pregunta 1
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
        p_item.paragraph_format.space_after = Pt(3)
        r_b = p_item.add_run("• " + b_txt)
        r_b.bold = True
        r_b.font.name = 'Calibri'
        r_b.font.color.rgb = RGBColor(27, 54, 93)
        r_n = p_item.add_run(n_txt)
        r_n.font.name = 'Calibri'

    # Pregunta 2
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
        p_item.paragraph_format.space_after = Pt(3)
        r_b = p_item.add_run("• " + b_txt)
        r_b.bold = True
        r_b.font.name = 'Calibri'
        r_b.font.color.rgb = RGBColor(180, 83, 9)
        r_n = p_item.add_run(n_txt)
        r_n.font.name = 'Calibri'

    # Pregunta 3
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
        p_item.paragraph_format.space_after = Pt(3)
        r_b = p_item.add_run("• " + b_txt)
        r_b.bold = True
        r_b.font.name = 'Calibri'
        r_b.font.color.rgb = RGBColor(185, 28, 28) # Red
        r_n = p_item.add_run(n_txt)
        r_n.font.name = 'Calibri'

    # -------------------------------------------------------------
    # 2.2 TABLA MAESTRA DE ELEMENTOS DE CONFIGURACIÓN
    # -------------------------------------------------------------
    doc.add_page_break()
    add_heading_with_spacing(doc, "2.2. Tabla de Elementos de Configuración del Software (SCI Inventory)", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "A continuación se presenta el inventario exhaustivo de los Elementos de Configuración del Software (Software Configuration Items - SCI) identificados en el proyecto Tranki, clasificados rigurosamente en las ocho (8) categorías requeridas por la guía académica:")

    table_data = [
        # Cat 1: Código fuente
        ("Código Fuente\n(Dominio)", "Entidades puras y Value Objects inmutables (Account, Card, Trip, Money, eventos). Lógica central de negocio aislada.", "Responsable Técnico", "src/main/java/com/tranki/backend/*/domain/", "Media", "Crítico"),
        ("Código Fuente\n(Aplicación)", "Casos de uso del sistema (IssueCardUseCase, RechargeAccountUseCase, ProcessTripBatchUseCase, etc.).", "Responsable Técnico", "src/main/java/com/tranki/backend/*/application/", "Alta", "Crítico"),
        ("Código Fuente\n(Adaptadores)", "Controladores REST (/cards, /accounts, /trips) y adaptadores de persistencia JPA (Repositories y Mappers).", "Responsable Técnico", "src/main/java/com/tranki/backend/*/adapter/", "Alta", "Alto"),
        ("Código Fuente\n(Entrypoint)", "Clase principal de arranque de Spring Boot y configuración global del contexto de la aplicación.", "Responsable Técnico", "src/main/java/com/tranki/backend/TrankiApplication.java", "Baja", "Crítico"),
        
        # Cat 2: Documentación técnica
        ("Documentación Técnica\n(Reglas de Dominio)", "Constitución inmutable del negocio: agregados, invariantes, estados de tarjetas, tarifas y traducción de campos.", "Coordinador de Configuración", ".specs/constitution/domain-rules.md", "Baja", "Crítico"),
        ("Documentación Técnica\n(Stack y Arquitectura)", "Definición de arquitectura Hexagonal, convenciones Java 21, estándares REST y directrices de testing.", "Coordinador de Configuración", ".specs/constitution/tech-stack.md", "Baja", "Alto"),
        ("Documentación Técnica\n(Guía para Agentes)", "Instrucciones de desarrollo Spec-Driven (SDD) para desarrolladores y asistentes IA.", "Documentador", "AGENT.md", "Media", "Medio"),
        ("Documentación Técnica\n(README General)", "Manual de inducción, pre-requisitos de ejecución local/Docker, comandos y ejemplos de API con curl.", "Documentador", "README.md", "Media", "Alto"),

        # Cat 3: Requisitos o historias de usuario
        ("Requisitos\n(Historias de Tarjeta)", "Historias de usuario formales Mike Cohn: emisión (US-01), tarifas (US-02), configuración (US-03) y bloqueos (US-04, 05).", "Coordinador de Configuración", ".specs/features/tarjeta/US-*.md", "Media", "Alto"),
        ("Requisitos\n(Historias de Cuenta)", "Historias de usuario: recargas idempotentes (US-06), transferencias (US-07) y consulta de movimientos (US-08).", "Coordinador de Configuración", ".specs/features/cuenta/US-*.md", "Media", "Crítico"),
        ("Requisitos\n(Historias de Viaje/Validador)", "Historias de abordaje offline en ESP32 (US-09), lotes de viajes (US-10) y sincronización de lista negra (US-11).", "Coordinador de Configuración", ".specs/features/{viaje,validador,listanegra}/US-*.md", "Media", "Crítico"),

        # Cat 4: Casos de prueba
        ("Casos de Prueba\n(Escenarios Gherkin)", "Especificaciones ejecutables BDD en formato Gherkin (.feature) en español con identificación formal de campos.", "Revisor de Cambios", "src/test/resources/features/*/*.feature", "Alta", "Crítico"),
        ("Casos de Prueba\n(Step Definitions)", "Clases Java de enlace Cucumber (*Steps.java) que ejecutan aserciones y manipulan repositorios de prueba.", "Revisor de Cambios", "src/test/java/com/tranki/backend/*Steps.java", "Alta", "Crítico"),
        ("Casos de Prueba\n(Configuración Runner)", "Suite de pruebas JUnit 5 y configuración del contexto Spring Boot de pruebas (@RecordApplicationEvents).", "Responsable Técnico", "src/test/java/com/tranki/backend/CucumberTest*.java", "Baja", "Alto"),
        ("Casos de Prueba\n(Reportes Surefire)", "Reportes XML y resúmenes de texto generados tras la ejecución de las 45 pruebas automatizadas.", "Documentador", "target/surefire-reports/", "Alta (Auto)", "Medio"),

        # Cat 5: Archivos de configuración
        ("Archivos de Configuración\n(Spring Boot)", "Configuración de conexión H2 / PostgreSQL, Hibernate DDL, logging y puerto 8080 del servidor.", "Responsable Técnico", "src/main/resources/application.yml", "Media", "Crítico"),
        ("Archivos de Configuración\n(Docker & Compose)", "Definición del contenedor multi-etapa y orquestación con la base de datos PostgreSQL 16.", "Responsable Técnico", "Dockerfile, docker-compose.yml, .dockerignore", "Baja", "Alto"),
        ("Archivos de Configuración\n(Control de Versiones)", "Reglas de exclusión de binarios, archivos temporales y reportes locales en el repositorio Git.", "Coordinador de Configuración", ".gitignore", "Baja", "Medio"),

        # Cat 6: Dependencias o librerías
        ("Dependencias\n(Maven POM)", "Descriptor Maven de dependencias de producción (Spring Boot, JPA, Postgres) y testing (Cucumber, AssertJ).", "Responsable Técnico", "pom.xml", "Baja", "Crítico"),
        ("Dependencias\n(Maven Wrapper)", "Binarios y propiedades del motor Maven Wrapper 3.9.9 para garantizar compilación uniforme en cualquier SO.", "Responsable Técnico", ".mvn/wrapper/, mvnw, mvnw.cmd", "Baja", "Alto"),

        # Cat 7: Base de datos o scripts
        ("Base de Datos\n(Entidades JPA)", "Mapeos relacionales ORM desacoplados del dominio (AccountJpaEntity, CardJpaEntity, TripJpaEntity) con esquemas DDL automáticos.", "Responsable Técnico", "src/main/java/com/tranki/backend/*/adapter/out/persistence/", "Media", "Crítico"),
        ("Base de Datos\n(Soft Foreign Keys)", "Referencias por identidad entre tablas derivadas de Agregados DDD (cards.account_id, accounts.user_id, trips.card_id/account_id) sin constraints SQL rígidos.", "Responsable Técnico", "Entidades JPA / Modelos de Persistencia", "Baja", "Crítico"),
        ("Base de Datos\n(Persistencia Docker)", "Volumen persistente de base de datos PostgreSQL tranki_pgdata para conservar datos transaccionales entre reinicios.", "Responsable Técnico", "docker-compose.yml (Volume tranki_pgdata)", "Baja", "Alto"),

        # Cat 8: Manuales o entregables
        ("Entregables\n(Binario Ejecutable)", "Archivo empaquetado ejecutable JAR autocontenido (tranki-backend-0.0.1-SNAPSHOT.jar).", "Responsable Técnico", "target/*.jar", "Alta (Build)", "Crítico"),
        ("Manuales\n(Guía de Operación)", "Documentación operativa de despliegue, APIs REST y procedimientos de troubleshooting.", "Documentador", "README.md, .specs/constitution/", "Media", "Alto")
    ]
    
    # Create Table
    table = doc.add_table(rows=len(table_data) + 1, cols=6)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    col_widths = [Inches(1.1), Inches(1.8), Inches(1.1), Inches(1.3), Inches(0.6), Inches(0.6)]
    for row in table.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = width

    # Header Row
    headers = ["Elemento (SCI)", "Descripción", "Responsable", "Ubicación", "Frecuencia", "Criticidad"]
    hdr_cells = table.rows[0].cells
    for idx, text in enumerate(headers):
        set_cell_background(hdr_cells[idx], "1B365D") # Navy
        set_cell_margins(hdr_cells[idx], top=100, bottom=100, left=60, right=60)
        p = hdr_cells[idx].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(text)
        r.bold = True
        r.font.name = 'Calibri'
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    # Data Rows
    for row_idx, data_row in enumerate(table_data):
        row_cells = table.rows[row_idx + 1].cells
        bg_col = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
        
        for col_idx, cell_value in enumerate(data_row):
            cell = row_cells[col_idx]
            set_cell_background(cell, bg_col)
            set_cell_margins(cell, top=80, bottom=80, left=50, right=50)
            
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
            
            # Align center for frequency and criticality
            if col_idx in [4, 5]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                
            r = p.add_run(cell_value)
            r.font.name = 'Calibri'
            r.font.size = Pt(8.5)
            
            # Formatting highlight for criticality
            if col_idx == 5:
                r.bold = True
                if cell_value == "Crítico":
                    r.font.color.rgb = RGBColor(185, 28, 28) # Red
                elif cell_value == "Alto":
                    r.font.color.rgb = RGBColor(194, 65, 12) # Orange
                else:
                    r.font.color.rgb = RGBColor(21, 128, 61) # Green
            elif col_idx == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(27, 54, 93)
            else:
                r.font.color.rgb = RGBColor(51, 51, 51)
                
    # -------------------------------------------------------------
    # 2.3 REFERENCIAS DE BASE DE DATOS Y SOFT FOREIGN KEYS (DDD)
    # -------------------------------------------------------------
    add_heading_with_spacing(doc, "2.3. Arquitectura de Base de Datos DDD: Referencias por Identidad (Soft Foreign Keys)", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "Una de las decisiones arquitectónicas y de configuración más determinantes en Tranki proviene directamente de los principios de Domain-Driven Design (DDD): la regla de 'Referencia entre Agregados exclusivamente por Identidad' (Reference by Identity). En lugar de modelar relaciones relacionales rígidas mediante claves foráneas duras (Hard Foreign Keys con constraints SQL o anotaciones @ManyToOne / @OneToMany de JPA), el sistema implementa Soft Foreign Keys (claves foráneas lógicas por identificador primitivo o UUID).",
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
        p_item.paragraph_format.space_after = Pt(3)
        r_b = p_item.add_run("• " + b_txt)
        r_b.bold = True
        r_b.font.name = 'Calibri'
        r_b.font.color.rgb = RGBColor(27, 54, 93)
        r_n = p_item.add_run(n_txt)
        r_n.font.name = 'Calibri'

    add_paragraph_styled(doc,
        "Esta estrategia de 'Soft Foreign Keys' surgida del DDD aporta beneficios directos sobre la Gestión de Configuración (SCM) y el Aseguramiento de la Calidad (QA):",
        bold_prefix="Impacto en la Gestión de Configuración y Calidad: ")

    benefits_soft_fk = [
        ("Independencia y Aislamiento de Esquemas: ", "Los esquemas DDL de cada tabla pueden evolucionar, alterarse, migrarse o limpiarse independientemente sin generar errores de integridad referencial cíclica ni bloqueos entre módulos."),
        ("Resiliencia del Modelo Offline-First: ", "Los validadores físicos ESP32 cobran viajes en los buses sin conexión síncrona al backend. Cuando el bus sincroniza el lote masivo, la persistencia en 'trips' no requiere validar bloqueos foráneos en cascada, aumentando drásticamente el throughput."),
        ("Reemplazo Limpio de Plásticos por Pérdida (US-04): ", "Al reportar una tarjeta perdida, se crea una nueva tarjeta física (nuevo cardId) que simplemente apunta al mismo 'accountId' mediante su Soft Foreign Key. La cuenta, su saldo y su historial de movimientos no requieren clonación ni migraciones de claves relacionales."),
        ("Preparación Nativa para Microservicios: ", "Si en el futuro los módulos 'card', 'account' y 'trip' se segregan en microservicios con bases de datos aisladas, no se requiere rediseñar la persistencia porque nunca existieron Foreign Keys duras entre ellas.")
    ]
    for b_txt, n_txt in benefits_soft_fk:
        p_item = doc.add_paragraph()
        p_item.paragraph_format.left_indent = Inches(0.25)
        p_item.paragraph_format.space_after = Pt(3)
        r_b = p_item.add_run("✔ " + b_txt)
        r_b.bold = True
        r_b.font.name = 'Calibri'
        r_b.font.color.rgb = RGBColor(21, 128, 61) # Green
        r_n = p_item.add_run(n_txt)
        r_n.font.name = 'Calibri'

    doc.add_page_break()

    # -------------------------------------------------------------
    # 2.4 REGLAS DE ROLES Y LÍNEAS BASE
    # -------------------------------------------------------------
    add_heading_with_spacing(doc, "2.4. Asignación de Roles en la Gestión de Configuración", level=2, color_rgb=(41, 70, 115))
    
    add_paragraph_styled(doc,
        "Siguiendo estrictamente los roles sugeridos en la guía académica de la Universidad Continental, el equipo de desarrollo de Tranki distribuye las responsabilidades de control de configuración de la siguiente manera:",
        bold_prefix="Estructura de Responsabilidades: ")
        
    roles_desc = [
        ("Coordinador de Configuración: ", "Responsable de administrar el inventario formal de SCIs, auditar periódicamente que ningún commit eluda las convenciones de trazabilidad, velar por la estabilidad de las líneas base (baselines) y validar la coherencia entre las reglas de dominio (.specs/constitution/) y los requerimientos aprobados."),
        ("Responsable Técnico: ", "Encargado de la implementación técnica y ejecución en las herramientas de configuración. Administra el repositorio Git, la configuración del wrapper de Maven (pom.xml), la orquestación de Docker/Compose, la automatización del pipeline de construcción y la resolución de conflictos técnicos de integración."),
        ("Revisor de Cambios: ", "Supervisa y valida el flujo de control de cambios. Revisa los Pull Requests (PRs), audita la calidad de los commits bajo convención Conventional Commits, asegura la cobertura de pruebas BDD en Gherkin y verifica que todo cambio cuente con sus respectivos Step Definitions antes de ser fusionado a ramas principales."),
        ("Documentador: ", "Registra las decisiones de diseño arquitectónico, mantiene actualizado el archivo README.md, documenta las actas de reunión y solicitudes de cambio (RFC / Issues), y gestiona el histórico de reportes de calidad emitidos tras cada corrida de pruebas.")
    ]
    for r_title, r_desc in roles_desc:
        p_role = doc.add_paragraph()
        p_role.paragraph_format.left_indent = Inches(0.2)
        p_role.paragraph_format.space_after = Pt(4)
        r_t = p_role.add_run(r_title)
        r_t.bold = True
        r_t.font.name = 'Calibri'
        r_t.font.color.rgb = RGBColor(27, 54, 93)
        r_d = p_role.add_run(r_desc)
        r_d.font.name = 'Calibri'

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
        p_base.paragraph_format.space_after = Pt(4)
        r_t = p_base.add_run(b_title)
        r_t.bold = True
        r_t.font.name = 'Calibri'
        r_t.font.color.rgb = RGBColor(180, 83, 9)
        r_d = p_base.add_run(b_desc)
        r_d.font.name = 'Calibri'

    # Conclusión
    add_heading_with_spacing(doc, "3. Conclusiones de la Fase 1", level=1)
    
    conclusiones = [
        "Identificación Exhaustiva: Se logró mapear el 100% de los productos de trabajo de Tranki en 22 ítems de configuración específicos distribuidos en las 8 categorías obligatorias de la rúbrica.",
        "Alineación con la Arquitectura Hexagonal y BDD: La separación entre especificaciones (.specs/), pruebas vivas (.feature), modelos puros de dominio (domain/) y configuraciones de despliegue (docker/) permite un control de cambios quirúrgico con mínimo acoplamiento.",
        "Garantía de Calidad Preventiva: Identificar tempranamente la criticidad de artefactos financieros (como Account.java y ProcessTripBatchUseCase.java) previene alteraciones involuntarias que podrían comprometer la recaudación real de transporte público.",
        "Preparación para las Fases 2 y 3: Con este inventario estructurado, el equipo cuenta con la base indispensable para diseñar el flujo de aprobación de cambios (Fase 2) y parametrizar las ramas y convenciones en Git/GitHub (Fase 3)."
    ]
    for c_text in conclusiones:
        p_c = doc.add_paragraph()
        p_c.paragraph_format.left_indent = Inches(0.2)
        p_c.paragraph_format.space_after = Pt(4)
        r_bullet = p_c.add_run("✔ ")
        r_bullet.bold = True
        r_bullet.font.color.rgb = RGBColor(21, 128, 61) # Green
        r_txt = p_c.add_run(c_text)
        r_txt.font.name = 'Calibri'

    # Save to Desktop
    desktop_path = r"C:\Users\eliak\OneDrive\Desktop"
    output_filename = os.path.join(desktop_path, "Fase_1_Gestion_Configuracion_Tranki.docx")
    doc.save(output_filename)
    print(f"Document saved successfully at: {output_filename}")
    return output_filename

if __name__ == "__main__":
    create_document()
