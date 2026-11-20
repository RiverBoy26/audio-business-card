-- СФЕРЫ IT

INSERT INTO spheres (id, name)
VALUES
    (gen_random_uuid(), 'Веб-разработка'),
    (gen_random_uuid(), 'Мобильная разработка'),
    (gen_random_uuid(), 'Разработка ПО'),
    (gen_random_uuid(), 'Тестирование'),
    (gen_random_uuid(), 'Данные и машинное обучение'),
    (gen_random_uuid(), 'Инфраструктура'),
    (gen_random_uuid(), 'Информационная безопасность'),
    (gen_random_uuid(), 'Дизайн и аналитика')
ON CONFLICT (name) DO NOTHING;


-- СТЕК: ЯЗЫКИ ПРОГРАММИРОВАНИЯ

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'Java'),
    (gen_random_uuid(), 'Python'),
    (gen_random_uuid(), 'C'),
    (gen_random_uuid(), 'C++'),
    (gen_random_uuid(), 'C#'),
    (gen_random_uuid(), 'JavaScript'),
    (gen_random_uuid(), 'TypeScript'),
    (gen_random_uuid(), 'Go'),
    (gen_random_uuid(), 'PHP'),
    (gen_random_uuid(), 'Kotlin'),
    (gen_random_uuid(), 'Swift'),
    (gen_random_uuid(), 'Dart'),
    (gen_random_uuid(), 'SQL'),
    (gen_random_uuid(), 'Bash'),
    (gen_random_uuid(), 'PowerShell'),
    (gen_random_uuid(), 'Встроенный язык 1С'),
    (gen_random_uuid(), 'Язык запросов 1С')
ON CONFLICT (name) DO NOTHING;


-- ФРОНТЕНД И ВЕБ-РАЗРАБОТКА

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'HTML'),
    (gen_random_uuid(), 'CSS'),
    (gen_random_uuid(), 'React'),
    (gen_random_uuid(), 'Vue.js'),
    (gen_random_uuid(), 'Angular'),
    (gen_random_uuid(), 'Next.js'),
    (gen_random_uuid(), 'Tailwind CSS'),
    (gen_random_uuid(), 'Node.js'),
    (gen_random_uuid(), 'Express'),
    (gen_random_uuid(), 'NestJS'),
    (gen_random_uuid(), 'React Native'),
    (gen_random_uuid(), 'Electron')
ON CONFLICT (name) DO NOTHING;


-- БЭКЕНД И ФРЕЙМВОРКИ

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'Spring Boot'),
    (gen_random_uuid(), 'FastAPI'),
    (gen_random_uuid(), 'Django'),
    (gen_random_uuid(), 'ASP.NET Core'),
    (gen_random_uuid(), 'Laravel'),
    (gen_random_uuid(), '.NET'),
    (gen_random_uuid(), 'Android SDK'),
    (gen_random_uuid(), 'Jetpack Compose'),
    (gen_random_uuid(), 'SwiftUI'),
    (gen_random_uuid(), 'UIKit'),
    (gen_random_uuid(), 'Flutter'),
    (gen_random_uuid(), 'WPF'),
    (gen_random_uuid(), 'Qt'),
    (gen_random_uuid(), 'JavaFX'),
    (gen_random_uuid(), '1С:Предприятие')
ON CONFLICT (name) DO NOTHING;


-- РАЗРАБОТКА ИГР И ГРАФИКА

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'Unity'),
    (gen_random_uuid(), 'Unreal Engine'),
    (gen_random_uuid(), 'Godot'),
    (gen_random_uuid(), 'Blender')
ON CONFLICT (name) DO NOTHING;


-- БАЗЫ ДАННЫХ И ХРАНИЛИЩА

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'PostgreSQL'),
    (gen_random_uuid(), 'MySQL'),
    (gen_random_uuid(), 'SQLite'),
    (gen_random_uuid(), 'Microsoft SQL Server'),
    (gen_random_uuid(), 'MongoDB'),
    (gen_random_uuid(), 'Redis'),
    (gen_random_uuid(), 'ClickHouse')
ON CONFLICT (name) DO NOTHING;


-- АНАЛИЗ ДАННЫХ И МАШИННОЕ ОБУЧЕНИЕ

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'Excel'),
    (gen_random_uuid(), 'Power BI'),
    (gen_random_uuid(), 'Tableau'),
    (gen_random_uuid(), 'pandas'),
    (gen_random_uuid(), 'NumPy'),
    (gen_random_uuid(), 'Jupyter'),
    (gen_random_uuid(), 'scikit-learn'),
    (gen_random_uuid(), 'PyTorch'),
    (gen_random_uuid(), 'TensorFlow'),
    (gen_random_uuid(), 'MLflow')
ON CONFLICT (name) DO NOTHING;


-- ТЕСТИРОВАНИЕ

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'Postman'),
    (gen_random_uuid(), 'Swagger / OpenAPI'),
    (gen_random_uuid(), 'DevTools'),
    (gen_random_uuid(), 'Selenium'),
    (gen_random_uuid(), 'Playwright'),
    (gen_random_uuid(), 'Cypress'),
    (gen_random_uuid(), 'pytest'),
    (gen_random_uuid(), 'JUnit')
ON CONFLICT (name) DO NOTHING;


-- DEVOPS И ИНФРАСТРУКТУРА

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'Linux'),
    (gen_random_uuid(), 'Windows Server'),
    (gen_random_uuid(), 'Docker'),
    (gen_random_uuid(), 'Kubernetes'),
    (gen_random_uuid(), 'Nginx'),
    (gen_random_uuid(), 'GitLab CI/CD'),
    (gen_random_uuid(), 'GitHub Actions'),
    (gen_random_uuid(), 'Jenkins'),
    (gen_random_uuid(), 'Ansible'),
    (gen_random_uuid(), 'Terraform'),
    (gen_random_uuid(), 'Active Directory')
ON CONFLICT (name) DO NOTHING;


-- ИНФОРМАЦИОННАЯ БЕЗОПАСНОСТЬ

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'Wireshark'),
    (gen_random_uuid(), 'Nmap'),
    (gen_random_uuid(), 'Burp Suite')
ON CONFLICT (name) DO NOTHING;


-- ДИЗАЙН И АНАЛИТИКА

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'Figma'),
    (gen_random_uuid(), 'Adobe Photoshop'),
    (gen_random_uuid(), 'Adobe Illustrator'),
    (gen_random_uuid(), 'BPMN'),
    (gen_random_uuid(), 'UML'),
    (gen_random_uuid(), 'Jira'),
    (gen_random_uuid(), 'Confluence')
ON CONFLICT (name) DO NOTHING;


-- СИСТЕМЫ КОНТРОЛЯ ВЕРСИЙ

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'Git'),
    (gen_random_uuid(), 'GitHub'),
    (gen_random_uuid(), 'GitLab')
ON CONFLICT (name) DO NOTHING;


-- ОБМЕН СООБЩЕНИЯМИ И API

INSERT INTO stacks (id, name)
VALUES
    (gen_random_uuid(), 'RabbitMQ'),
    (gen_random_uuid(), 'Apache Kafka'),
    (gen_random_uuid(), 'Apache Airflow'),
    (gen_random_uuid(), 'Apache Spark'),
    (gen_random_uuid(), 'REST API'),
    (gen_random_uuid(), 'HTTP'),
    (gen_random_uuid(), 'WebSocket'),
    (gen_random_uuid(), 'gRPC')
ON CONFLICT (name) DO NOTHING;