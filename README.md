# DevOps Academy

[![DevOps Academy](https://img.shields.io/badge/DevOps%20Academy-09090b?style=for-the-badge&logo=githubpages&logoColor=white)](https://mohammadijoo.github.io/DevOps_Academy/)
[![Courses](https://img.shields.io/badge/Courses-37-7c3aed?style=flat-square)](https://mohammadijoo.github.io/DevOps_Academy/#courses)
[![Learning Stages](https://img.shields.io/badge/Learning%20Stages-12-0891b2?style=flat-square)](https://mohammadijoo.github.io/DevOps_Academy/#roadmap)
[![Available Courses](https://img.shields.io/badge/Available%20Courses-9-059669?style=flat-square)](https://mohammadijoo.github.io/DevOps_Academy/#courses)

DevOps Academy is a browser-native learning platform for DevOps engineering, software delivery, infrastructure automation, cloud platforms, observability, testing, and security. The academy organizes 37 widely used DevOps tools into a prerequisite-aware path that progresses from Linux and version control to containers, infrastructure as code, GitOps, observability, and public cloud platforms.

The website is implemented as a static GitHub Pages project. Lessons can be studied online or downloaded and opened locally without a server, database, account, or learning-management platform. The academy currently includes 9 fully published courses with 1,215 published lessons, while the complete 37-course roadmap and curricula remain available for the courses still in progress.

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

The academy currently has **9 fully published courses with 1,215 lessons**:

- **[Linux](https://mohammadijoo.github.io/DevOps_Academy/courses/linux/)** — 20 chapters · 100 lessons published
- **[Bash](https://mohammadijoo.github.io/DevOps_Academy/courses/bash/)** — 20 chapters · 100 lessons published
- **[PowerShell](https://mohammadijoo.github.io/DevOps_Academy/courses/powershell/)** — 20 chapters · 100 lessons published
- **[Git](https://mohammadijoo.github.io/DevOps_Academy/courses/git/)** — 26 chapters · 130 lessons published
- **[GitHub](https://mohammadijoo.github.io/DevOps_Academy/courses/github/)** — 32 chapters · 160 lessons published
- **[GitLab](https://mohammadijoo.github.io/DevOps_Academy/courses/gitlab/)** — 34 chapters · 170 lessons published
- **[Maven & Gradle](https://mohammadijoo.github.io/DevOps_Academy/courses/maven-gradle/)** — 31 chapters · 155 lessons published
- **[Nexus Repository](https://mohammadijoo.github.io/DevOps_Academy/courses/nexus-repository/)** — 30 chapters · 150 lessons published
- **[Selenium](https://mohammadijoo.github.io/DevOps_Academy/courses/selenium/)** — 30 chapters · 150 lessons published

These published courses use the academy's shared lesson architecture, including searchable course navigation, active-lesson highlighting, responsive on-page tables of contents, syntax highlighting, Mermaid diagrams and exports, knowledge checks, progress tracking, previous/next navigation, references, support sections, and consistent lesson footers.

### Planned

- The remaining **28 courses** shown in the 37-course learning roadmap

Planned courses remain visible in their correct learning stages with linked curriculum pages and will be activated as their full lesson content is completed.

## Platform Features

- Modern responsive interface for desktop, tablet, and mobile devices
- Light and dark themes with persistent user preference
- Searchable and filterable 37-course catalogue
- Sequential learning path with clear course categories and prerequisites
- Dedicated curriculum pages and complete lesson sets for the 9 published courses, with stable curriculum paths for the remaining planned courses
- Responsive lesson sidebar that automatically positions the active chapter at the top
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
    ├── bash/
    │   ├── index.html
    │   ├── curriculum.json
    │   └── Chapter01 ... Chapter20/
    ├── powershell/
    │   ├── index.html
    │   ├── curriculum.json
    │   └── Chapter01 ... Chapter20/
    ├── git/
    │   ├── index.html
    │   ├── curriculum.json
    │   └── Chapter01 ... Chapter26/
    ├── github/
    │   └── Chapter01 ... Chapter32/
    ├── gitlab/
    │   └── Chapter01 ... Chapter34/
    ├── maven-gradle/
    │   └── Chapter01 ... Chapter31/
    ├── nexus-repository/
    │   └── Chapter01 ... Chapter30/
    ├── selenium/
    │   └── Chapter01 ... Chapter30/
    └── ... 28 additional course directories
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
