import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
// Detect user language from browser settings
.use(LanguageDetector)
// Pass the i18n instance to react-i18next
.use(initReactI18next)
// Initialize i18next
.init({
debug: true, // Set to false in production
fallbackLng: 'fr', // Use French if the detected language is not available
interpolation: {
escapeValue: false, // React already protects from XSS
},
detection: {
// Order and from where user language should be detected
order: ['localStorage', 'cookie', 'navigator', 'htmlTag', 'path', 'subdomain'],
// Keys or params to lookup language from
lookupCookie: 'i18next',
lookupLocalStorage: 'i18nextLng',
// Cache user language on
caches: ['localStorage', 'cookie'],
},
resources: {
en: {
translation: {
// General / Common Terms
common: {
search: 'Search...',
actions: 'Actions',
edit: 'Edit',
delete: 'Delete',
add: 'Add',
save: 'Save',
cancel: 'Cancel',
close: 'Close',
backToList: 'Back to list',
previous: 'Previous',
next: 'Next',
view: 'View',
filters: 'Filters',
all: 'All',
none: 'None',
description: 'Description',
name: 'Name',
title: 'Title',
client: 'Client',
module: 'Module',
priority: 'Priority',
status: 'Status',
requester: 'Requester',
creationDate: 'Creation Date',
members: 'Members',
team: 'Team',
teams: 'Teams',
post: 'Post',
posts: 'Posts',
details: 'Details',
selectAnImage: 'Select an image',
noResultsFound: 'No {{item}} found.', // e.g., No users found.
},

      // Roles
      roles: {
        admin: 'Administrator',
        teamLead: 'Team Lead',
        user: 'User',
      },

      // Statuses
      status: {
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        inProgress: 'In Progress',
        resolved: 'Resolved',
        closed: 'Closed',
        refused: 'Refused',
        accepted: 'Accepted',
      },

      // Priority Levels
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical',
      },
      
      // Main Navigation
      navigation: {
        main: 'Navigation',
        dashboard: 'Dashboard',
        ticketManagement: 'Ticket Management',
        pendingTickets: 'Pending Tickets',
        acceptedTickets: 'Accepted Tickets',
        assignTickets: 'Assign Tickets',
        management: 'Management',
        users: 'Users',
        teams: 'Teams',
        posts: 'Posts',
        modules: 'Modules',
        clients: 'Clients',
        myTeams: 'My Teams',
        myAssignedTickets: 'My Assigned Tickets',
        myResolvedTickets: 'My Resolved Tickets',
        myRefusedTickets: 'My Refused Tickets',
        myWorkInProgress: 'My Work In Progress',
        ticketsToProcess: "Tickets to Process",
        assignmentTracking: "Assignment Tracking",
      },

      // Page Specific Translations
      pages: {
        login: {
          title: 'Login',
          email: 'Email',
          password: 'Password',
          connect: 'Connect',
        },
        navbar: {
          logout: 'Logout',
          notifications: 'Notifications',
          profile: 'Profile',
          lightMode: 'Light Mode',
          darkMode: 'Dark Mode',
          changeLanguage: 'Change Language',
        },
        userManagement: {
          title: 'User Management',
          addUser: 'Add User',
          searchUser: 'Search for a user...',
          allUsers: 'All',
          activeUsers: 'Active',
          inactiveUsers: 'Inactive',
          role: 'Role',
          teamsAndPosts: 'Teams / Posts',
          addUserTitle: 'Add a New User',
          userInfo: 'User Information',
          firstName: 'First Name',
          lastName: 'Last Name',
          login: 'Login',
          phoneNumber: 'Phone Number',
          profilePicture: 'Profile Picture',
          roleAndStatus: 'Role and Status',
          confirmDelete: 'Are you sure you want to delete this user?',
        },
        teamManagement: {
          title: 'Team Management',
          addTeam: 'Add a Team',
          searchTeam: 'Search for a team...',
          teamName: 'Team Name',
          teamLead: 'Team Lead',
          confirmDelete: 'Are you sure you want to delete this team?',
        },
        postManagement: {
            title: 'Post Management',
            addPost: 'Add a Post',
            searchPost: 'Search for a post...',
            designation: 'Designation',
            confirmDelete: 'Are you sure you want to delete this post?',
        },
        ticketManagement: {
            title: 'Ticket Management',
            allTickets: 'All Tickets',
            assignTicket: 'Assign Ticket',
            ticketDetails: 'Ticket Details',
            subTickets: 'Sub-tickets',
            addDiffraction: 'Add Diffraction',
            confirmDelete: 'Are you sure you want to delete this ticket?',
        },
      },
    }
  },
  fr: {
    translation: {
      // Termes généraux / communs
      common: {
        search: 'Rechercher...',
        actions: 'Actions',
        edit: 'Modifier',
        delete: 'Supprimer',
        add: 'Ajouter',
        save: 'Sauvegarder',
        cancel: 'Annuler',
        close: 'Fermer',
        backToList: 'Retour à la liste',
        previous: 'Précédent',
        next: 'Suivant',
        view: 'Vue',
        filters: 'Filtres',
        all: 'Tous',
        none: 'Aucun',
        description: 'Description',
        name: 'Nom',
        title: 'Titre',
        client: 'Client',
        module: 'Module',
        priority: 'Priorité',
        status: 'Statut',
        requester: 'Demandeur',
        creationDate: 'Date de création',
        members: 'Membres',
        team: 'Équipe',
        teams: 'Équipes',
        post: 'Poste',
        posts: 'Postes',
        details: 'Détails',
        selectAnImage: 'Choisir une image',
        noResultsFound: 'Aucun {{item}} trouvé.', // e.g., Aucun utilisateur trouvé.
      },

      // Rôles
      roles: {
        admin: 'Administrateur',
        teamLead: 'Chef d\'équipe',
        user: 'Utilisateur',
      },

      // Statuts
      status: {
        active: 'Actif',
        inactive: 'Inactif',
        pending: 'En attente',
        inProgress: 'En cours',
        resolved: 'Résolu',
        closed: 'Clôturé',
        refused: 'Refusé',
        accepted: 'Accepté',
      },

      // Niveaux de priorité
      priorities: {
        low: 'Basse',
        medium: 'Moyenne',
        high: 'Haute',
        critical: 'Critique',
      },
      
      // Navigation principale
      navigation: {
        main: 'NAVIGATION',
        dashboard: 'Tableau de bord',
        ticketManagement: 'Gestion des Tickets',
        pendingTickets: 'Tickets en attente',
        acceptedTickets: 'Tickets acceptés',
        assignTickets: 'Affecter Tickets',
        management: 'GESTION',
        users: 'Utilisateurs',
        teams: 'Équipes',
        posts: 'Postes',
        modules: 'Modules',
        clients: 'Clients',
        myTeams: 'Mes Équipes',
        myAssignedTickets: 'Mes Tickets Assignés',
        myResolvedTickets: 'Mes Tickets Résolus',
        myRefusedTickets: 'Mes Tickets Refusés',
        myWorkInProgress: 'Mon Travail En Cours',
        ticketsToProcess: "Tickets à Traiter",
        assignmentTracking: "Suivi des Affectations",
      },

      // Traductions spécifiques aux pages
      pages: {
        login: {
          title: 'Se connecter',
          email: 'Email',
          password: 'Mot de passe',
          connect: 'Connexion',
        },
        navbar: {
          logout: 'Déconnexion',
          notifications: 'Notifications',
          profile: 'Profil',
          lightMode: 'Mode Clair',
          darkMode: 'Mode Sombre',
          changeLanguage: 'Changer la langue',
        },
        userManagement: {
          title: 'Gestion des Utilisateurs',
          addUser: 'Ajouter un utilisateur',
          searchUser: 'Rechercher un utilisateur...',
          allUsers: 'Tous',
          activeUsers: 'Actifs',
          inactiveUsers: 'Inactifs',
          role: 'Rôle',
          teamsAndPosts: 'Équipes / Postes',
          addUserTitle: 'Ajouter un Nouvel Utilisateur',
          userInfo: 'Informations sur l\'utilisateur',
          firstName: 'Prénom',
          lastName: 'Nom',
          login: 'Login',
          phoneNumber: 'Numéro de Téléphone',
          profilePicture: 'Photo de profil',
          roleAndStatus: 'Rôle et Statut',
          confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
        },
        teamManagement: {
          title: 'Gestion des Équipes',
          addTeam: 'Ajouter une équipe',
          searchTeam: 'Rechercher une équipe...',
          teamName: 'Nom de l\'équipe',
          teamLead: 'Chef d\'équipe',
          confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette équipe ?',
        },
        postManagement: {
            title: 'Gestion des Postes',
            addPost: 'Ajouter un poste',
            searchPost: 'Rechercher un poste...',
            designation: 'Désignation',
            confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce poste ?',
        },
        ticketManagement: {
            title: 'Gestion des Tickets',
            allTickets: 'Tous les tickets',
            assignTicket: 'Affecter Ticket',
            ticketDetails: 'Détails du Ticket',
            subTickets: 'Sous-tickets',
            addDiffraction: 'Ajouter Diffraction',
            confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce ticket ?',
        },
      },
    }
  }
}
});

export default i18n;
