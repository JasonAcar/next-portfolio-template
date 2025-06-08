-- Insert sample profile data
INSERT INTO profiles (name, title, bio, email, github_url, linkedin_url, avatar_url) VALUES
('John Doe', 'Full Stack Developer', 'Passionate software engineer with 5+ years of experience building web applications. I love creating efficient, scalable solutions and learning new technologies.', 'john@example.com', 'https://github.com/johndoe', 'https://linkedin.com/in/johndoe', '/placeholder.svg?height=200&width=200');

-- Insert sample projects
INSERT INTO projects (title, description, long_description, image_url, demo_url, github_url, technologies, featured, status) VALUES
('E-commerce Platform', 'Full-stack e-commerce solution with payment integration', 'A comprehensive e-commerce platform built with Next.js and Stripe. Features include product catalog, shopping cart, user authentication, order management, and admin dashboard.', '/placeholder.svg?height=300&width=400', 'https://demo.example.com', 'https://github.com/johndoe/ecommerce', ARRAY['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL', 'Tailwind CSS'], true, 'completed'),
('Task Management App', 'Collaborative project management tool', 'A modern task management application with real-time collaboration features. Built with React and Socket.io for live updates, drag-and-drop functionality, and team collaboration.', '/placeholder.svg?height=300&width=400', 'https://tasks.example.com', 'https://github.com/johndoe/taskapp', ARRAY['React', 'Node.js', 'Socket.io', 'MongoDB', 'Express'], true, 'completed'),
('Weather Dashboard', 'Real-time weather monitoring application', 'A responsive weather dashboard that displays current conditions and forecasts. Features location-based weather, interactive maps, and historical data visualization.', '/placeholder.svg?height=300&width=400', 'https://weather.example.com', 'https://github.com/johndoe/weather', ARRAY['Vue.js', 'Chart.js', 'OpenWeather API', 'CSS3'], false, 'completed');

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, published, tags) VALUES
('Getting Started with Next.js 15', 'getting-started-nextjs-15', 'Explore the new features and improvements in Next.js 15', '# Getting Started with Next.js 15\n\nNext.js 15 brings exciting new features and improvements that make building React applications even better. In this post, we''ll explore the key updates and how to get started.\n\n## Key Features\n\n- Improved performance\n- Better developer experience\n- Enhanced routing capabilities\n\nLet''s dive into each of these features...', true, ARRAY['Next.js', 'React', 'Web Development']),
('Building Scalable APIs with Node.js', 'scalable-apis-nodejs', 'Best practices for creating maintainable and scalable Node.js APIs', '# Building Scalable APIs with Node.js\n\nCreating scalable APIs is crucial for modern web applications. Here are the best practices I''ve learned over the years.\n\n## Architecture Patterns\n\n1. Layered Architecture\n2. Microservices\n3. Event-Driven Design\n\n## Implementation Details\n\nLet''s explore each pattern...', true, ARRAY['Node.js', 'API', 'Backend', 'Architecture']);

-- Insert sample technologies
INSERT INTO technologies (name, category, proficiency, icon_url) VALUES
('JavaScript', 'language', 5, '/placeholder.svg?height=50&width=50'),
('TypeScript', 'language', 5, '/placeholder.svg?height=50&width=50'),
('React', 'frontend', 5, '/placeholder.svg?height=50&width=50'),
('Next.js', 'frontend', 5, '/placeholder.svg?height=50&width=50'),
('Node.js', 'backend', 4, '/placeholder.svg?height=50&width=50'),
('PostgreSQL', 'database', 4, '/placeholder.svg?height=50&width=50'),
('MongoDB', 'database', 3, '/placeholder.svg?height=50&width=50'),
('Docker', 'tool', 3, '/placeholder.svg?height=50&width=50'),
('AWS', 'cloud', 3, '/placeholder.svg?height=50&width=50'),
('Git', 'tool', 5, '/placeholder.svg?height=50&width=50');

-- Insert sample experiences
INSERT INTO experiences (company, position, description, start_date, end_date, current, location) VALUES
('Tech Startup Inc.', 'Senior Full Stack Developer', 'Led development of core platform features, mentored junior developers, and architected scalable solutions serving 100k+ users.', '2022-01-01', NULL, true, 'San Francisco, CA'),
('Digital Agency Co.', 'Full Stack Developer', 'Developed custom web applications for clients, worked with React, Node.js, and various databases. Delivered 15+ successful projects.', '2020-03-01', '2021-12-31', false, 'New York, NY'),
('Freelance', 'Web Developer', 'Built websites and web applications for small businesses and startups. Specialized in modern JavaScript frameworks and responsive design.', '2019-01-01', '2020-02-29', false, 'Remote');
