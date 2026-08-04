# DevOps Academy

[![DevOps Academy](https://img.shields.io/badge/DevOps%20Academy-09090b?style=for-the-badge&logo=githubpages&logoColor=white)](https://mohammadijoo.github.io/DevOps_Academy/)
[![Courses](https://img.shields.io/badge/Courses-37-7c3aed?style=flat-square)](https://mohammadijoo.github.io/DevOps_Academy/#courses)
[![Learning Stages](https://img.shields.io/badge/Learning%20Stages-12-0891b2?style=flat-square)](https://mohammadijoo.github.io/DevOps_Academy/#roadmap)

DevOps Academy is a browser-native learning platform for DevOps engineering, software delivery, infrastructure automation, cloud platforms, observability, testing, and security. The academy organizes 37 widely used DevOps tools into a prerequisite-aware path that progresses from Linux and version control to containers, infrastructure as code, GitOps, observability, and public cloud platforms.

The website is implemented as a static GitHub Pages project. Lessons can be studied online or downloaded and opened locally without a server, database, account, or learning-management platform.

## Website

Visit the academy:

https://mohammadijoo.github.io/DevOps_Academy/

## Learning Path

The curriculum is organized into 12 sequential stages:

1. **Systems Foundations** — Linux, Bash, PowerShell
2. **Version Control & Collaboration** — Git, GitHub, GitLab
3. **Build & Artifact Management** — Maven & Gradle, Nexus Repository
4. **Testing & Code Quality** — Selenium, Robot Framework, Apache JMeter, SonarQube
5. **Continuous Integration & Delivery** — GitHub Actions, GitLab CI/CD, Jenkins
6. **Containers & Platforms** — Docker, Kubernetes, Helm, OpenShift & OKD
7. **Infrastructure & Configuration** — Terraform, Ansible, Vagrant, Puppet, Chef, Salt Project
8. **Web Delivery & Networking** — NGINX
9. **DevSecOps & Secrets** — Trivy, HashiCorp Vault
10. **GitOps Delivery** — Argo CD
11. **Monitoring, Logging & Observability** — Prometheus, Grafana, Elastic Stack, Nagios, Splunk
12. **Cloud Platforms** — Amazon Web Services, Microsoft Azure, Google Cloud Platform

## Current Course Status

### Available

- **Linux** — 20 chapters and 100 reserved lesson pages
- **Git** — 16 chapters and 80 reserved lesson pages

`courses/linux/Chapter01/Lesson1.html` is the first fully implemented lesson and establishes the shared lesson structure and presentation standard for future DevOps Academy content. The remaining lesson paths are reserved so the course structure and permanent URLs remain stable while the content is expanded.

### Planned

The other 35 courses are displayed in their correct learning stages and marked as planned. They will be activated as their curricula and lesson content are completed.

## Platform Features

- Modern responsive interface for desktop, tablet, and mobile devices
- Light and dark themes with persistent user preference
- Searchable and filterable 37-course catalogue
- Sequential learning path with clear course categories and prerequisites
- Dedicated Linux and Git curriculum pages
- Responsive lesson sidebar and generated table of contents
- Syntax highlighting and copy controls for command and code examples
- MathJax support for mathematical notation
- Theme-aware Mermaid diagrams
- Transparent high-resolution PNG and PowerPoint-friendly SVG diagram exports
- Reading-progress indicator and previous/next lesson navigation
- Donation section and author social links
- Custom 404 page, favicon, sitemap, robots file, and GitHub Pages configuration
- Static architecture with no backend, database, build system, or runtime dependency

## Repository Structure

```text
DevOps_Academy/
├── index.html
├── 404.html
├── LICENSE
├── README.md
├── .nojekyll
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── css/
│   ├── data/
│   ├── icons/
│   └── js/
└── courses/
    ├── linux/
    │   ├── index.html
    │   ├── curriculum.json
    │   └── Chapter01 ... Chapter20/
    └── git/
        ├── index.html
        ├── curriculum.json
        └── Chapter01 ... Chapter16/
```

## Technologies

The academy is built with semantic HTML5, modern CSS, and vanilla JavaScript. It uses Highlight.js for syntax highlighting, MathJax for formulas, and Mermaid for diagrams. The site is designed to run directly on GitHub Pages and to remain usable as a local offline copy.

## Educational Scope

The academy prioritizes tools that can be learned through open-source editions, community editions, local installations, developer sandboxes, free tiers, or limited free plans. Commercial and enterprise-only capabilities may be explained for completeness, but the practical lessons are designed so learners do not need to purchase a paid license.

## Author

**Abolfazl Mohammadijoo**

- Website: https://mohammadijoo.ir/
- GitHub: https://github.com/mohammadijoo
- X: https://x.com/mohammadijoo

## License

This repository uses a dual non-commercial licensing structure:

- Educational content is licensed under **CC BY-NC-SA 4.0**.
- Original source code and website implementation are licensed under **PolyForm Noncommercial 1.0.0**, unless otherwise stated.

See [LICENSE](LICENSE) for the complete repository licensing notice and commercial-use requirements.
