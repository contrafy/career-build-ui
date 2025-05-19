export interface FilterTemplate {
    label: string;   // what users see
    query: string;   // what we stuff into advancedTitle
}

export const FILTER_TEMPLATES: FilterTemplate[] = [
    {
        label: "Data science & software engineering",
        query:
            '((data) & (science | engineer | scientist | engineering)) | ((software) & (development | engineer | developer | engineering))',
    },
    {
        label: "Data science related (intern)",
        query:
            '(((data) & (science | engineer | scientist | engineering))) & (intern | internship)',
    },
    {
        label: "Data science & software engineering (intern)",
        query:
            '(((data) & (science | engineer | scientist | engineering)) | ((software) & (development | engineer | developer | engineering))) & (intern | internship)',
    },
    {
        label: "Backend / DevOps focus",
        query:
            '((backend | infrastructure | devops | platform) & (engineer | developer))',
    },
    {
        label: "Data science & data engineering roles",
        query:
            '((data) & (science | scientist | engineer | engineering | analytics))',
    },
    {
        label: "DevOps / SRE (cloud infrastructure)",
        query:
            '((devops | sre | reliability | platform) & (engineer | engineering | developer)) | ((infrastructure | cloud | platform) & (engineer | developer))',
    },
    {
        label: "Frontend (React / TypeScript)",
        query:
            '((frontend | front-end | ui | web) & (engineer | developer | development)) & (react | javascript | typescript)',
    },
    {
        label: "Cybersecurity / InfoSec engineer",
        query:
            '(((cybersecurity) | security | infosec | \'information security\') & (engineer | analyst | specialist | consultant))',
    },
    {
        label: "AI & Machine-Learning research / engineering",
        query:
            '((\'machine learning\' | ml | \'artificial intelligence\' | ai | \'deep learning\') & (engineer | engineering | scientist | research | researcher))',
    },
    {
        label: "AI / ML internships",
        query:
            '((\'machine learning\' | ml | \'artificial intelligence\' | ai) & (intern | internship))',
      },
];
  