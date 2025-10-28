export const entityConfigs = {
  users: {
    name: 'Users',
    apiEndpoint: 'users',
    idField: 'user',
    fields: ['nom', 'age'],
    columns: ['nom', 'age']
  },
  destinations: {
    name: 'Destinations',
    apiEndpoint: 'destinations',
    idField: 'dest',
    fields: ['nom', 'localisation'],
    columns: ['nom', 'localisation']
  },
  hebergements: {
    name: 'Hébergements',
    apiEndpoint: 'hebergements',
    idField: 'heb',
    fields: ['nom', 'prix', 'capacite'],
    columns: ['nom', 'prix', 'capacite']
  },
  activites: {
    name: 'Activites',
    apiEndpoint: 'activites',
    idField: 'act',
    fields: ['nom', 'description', 'prix', 'capacite'],
    columns: ['nom', 'description', 'prix', 'capacite']
  },
  restaurants: {
    name: 'Restaurants',
    apiEndpoint: 'restaurants',
    idField: 'rest',
    fields: ['nom', 'description', 'contact'],
    columns: ['nom', 'description', 'contact']
  },
  transports: {
    name: 'Transports',
    apiEndpoint: 'transports',
    idField: 'trans',
    fields: ['nom', 'prix', 'capacite', 'description'],
    columns: ['nom', 'prix', 'capacite', 'description']
  },
  evenements: {
    name: 'Événements',
    apiEndpoint: 'evenements',
    idField: 'event',
    fields: ['nom', 'dateDebut', 'dateFin', 'capacite', 'description'],
    columns: ['nom', 'dateDebut', 'dateFin', 'capacite']
  }
};

export const entityTabs = Object.keys(entityConfigs);