import React, { useState } from 'react';
import EntityManager from './components/EntityManager';
import { entityConfigs, entityTabs } from './config/entityConfig';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('users');

  const currentConfig = entityConfigs[activeTab];

  return (
    <div className="App">
      <header className="app-header">
        <h1>Ontology Tourism Management System</h1>
        <p>Manage your tourism knowledge base with SPARQL and RDF</p>
      </header>

      <nav className="tabs">
        {entityTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'active' : ''}
          >
            {entityConfigs[tab].name}
          </button>
        ))}
      </nav>

      <main className="content">
        <EntityManager
          key={activeTab}
          entityType={activeTab}
          entityName={currentConfig.name}
          apiEndpoint={currentConfig.apiEndpoint}
          fields={currentConfig.fields}
          columns={currentConfig.columns}
          idField={currentConfig.idField}
        />
      </main>

      <footer className="app-footer">
        <p>Built with React, Flask, and Apache Jena Fuseki</p>
      </footer>
    </div>
  );
}

export default App;
