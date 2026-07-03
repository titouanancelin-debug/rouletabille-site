/* Données : spectacles, ateliers, agenda, équipe, partenaires */
/* Contenu réel reconstitué depuis les archives du blog Overblog de la compagnie (site/articles.json, 296 articles, 2016-2026) */
const SPECTACLES = [
  { id:"3-fantastiques", num:"01", title:"Les 3 Fantastiques", tag:"Spectacle-conférence", date:"Créé en 2024", duration:"Durée non communiquée", ages:"Dès 8 ans", color:"#B84A2E", textColor:"#F4E8D5", desc:"Le destin de trois femmes remarquables liées à la Dordogne : Jeanne Barret, exploratrice et botaniste, première femme à avoir fait le tour du monde ; Jenny Sacerdote, couturière et modéliste ; Emma Reyes, artiste peintre colombienne. Un spectacle-conférence entre théâtre et expression plastique, né d'une commande de la Ville de Périgueux autour du choix du nom de la nouvelle école du Gour-de-l'Arche.", auteur:"Création collective Cie Rouletabille & Cie Lilo", mes:"Cie Rouletabille & Cie Lilo", with:"Émilie Esquerré, Garland Newman" },
  { id:"envol", num:"02", title:"L'Envol", tag:"Théâtre & marionnettes", date:"Créé en 2021 — en tournée", duration:"Durée variable selon la forme", ages:"Dès 8 ans", color:"#9B7AA8", textColor:"#F4E8D5", desc:"Un conte marionnettique sur le voyage et l'exil, porté par les grues cendrées qui migrent chaque année. Awa et Alphonse, deux marionnettes conçues par Fabrice Tanguy, prennent la route. Depuis 2023, le spectacle tourne aussi sous une forme allégée en lecture musicale, voix et musique.", auteur:"Cie Rouletabille", mes:"Loubna Chebouti", with:"Loubna Chebouti (comédienne), Sylvano (musicien), marionnettes de Fabrice Tanguy" },
  { id:"ici-ailleurs", num:"03", title:"Ici, ailleurs, nos coins de paradis", tag:"Création habitants", date:"Créé en 2023", duration:"Projection-restitution", ages:"Tout public", color:"#3A1B2E", textColor:"#F4E8D5", desc:"Une création portée par les habitants du quartier du Toulon et les habitué·es du lieu de vie sociale « le 800 » : voix, récits et images collectés puis mis en scène. Une traversée sensible entre l'ici du quartier et les ailleurs de chacun.", auteur:"Écriture collective — habitants du quartier du Toulon", mes:"Delphine Barbut (son), Ambre Ludwiczak (image), Émilie Esquerré (voix)", with:"Habitants du quartier du Toulon et du lieu de vie sociale « le 800 »" },
  { id:"la-vorace", num:"04", title:"La Vorace, Poésie-Rock", tag:"Concert-lecture", date:"Créé en 2021 — en tournée", duration:"Format concert", ages:"Tout public", color:"#8E3620", textColor:"#F4E8D5", desc:"Une interprétation rock du recueil « Levez-vous du tombeau » de Jean-Pierre Siméon. Voix, guitare électrique, contrebasse, batterie et clavier pour dire la poésie autrement.", auteur:"Jean-Pierre Siméon", mes:"Loubna Chebouti", with:"Loubna Chebouti (voix), Mathieu Bérenger (contrebasse), David Jalliffier-Verne (guitare électrique), Cyril Lababidi (batterie), Guillaume Pasquet (clavier, percussions, voix)" },
];

const AGENDA = [
  { day:"04", month:"Sep", year:"2025", title:"Mascarade — Cie Estomaquées", venue:"Filature de l'Isle, Périgueux", time:"Résidence 4–12 sept · sortie le 12", price:"Sortie de résidence", status:"free", type:"résidence", cardColor:"#3A1B2E", cardTextColor:"#F4E8D5" },
  { day:"20", month:"Sep", year:"2025", title:"Bal Salé — Cie Emilbus", venue:"Filature de l'Isle, Périgueux", time:"Résidence 20–27 sept", price:"Sortie de résidence festive", status:"free", type:"résidence", cardColor:"#3A1B2E", cardTextColor:"#F4E8D5" },
  { day:"24", month:"Oct", year:"2025", title:"Entre Tour et Bourg — Voix de femmes, regards croisés", venue:"Périgueux & Mensignac", time:"24–26 octobre", price:"Voir programme", status:"available", type:"événement", cardColor:"#8E3620", cardTextColor:"#F4E8D5" },
  { day:"25", month:"Nov", year:"2025", title:"Un Récit — Cie Lilo", venue:"Auditorium François Mitterrand, Bergerac", time:"18h00", price:"Voir Cie Lilo", status:"available", type:"spectacle", cardColor:"#B84A2E", cardTextColor:"#F4E8D5" },
  { day:"12", month:"Jan", year:"2026", title:"Cabane — Cie OLA", venue:"Filature de l'Isle, Périgueux", time:"Étape de travail · dispositif 24/33", price:"Accès limité", status:"free", type:"résidence", cardColor:"#3A1B2E", cardTextColor:"#F4E8D5" },
  { day:"19", month:"Jan", year:"2026", title:"Panique sous Terre — Cie Électrique Caravane", venue:"Filature de l'Isle, Périgueux", time:"Résidence · avec le Comité de Quartier du Toulon", price:"Séances scolaires + tout public", status:"free", type:"résidence", cardColor:"#3A1B2E", cardTextColor:"#F4E8D5" },
  { day:"02", month:"Fév", year:"2026", title:"Léonard de Vinci fait son Festival #2", venue:"Filature de l'Isle, Périgueux", time:"2–6 février · 8 représentations", price:"Scolaire & tout public", status:"available", type:"événement", cardColor:"#8E3620", cardTextColor:"#F4E8D5" },
  { day:"09", month:"Fév", year:"2026", title:"Fil A Fil — Collectif UGUGU & Cie Lilo", venue:"Filature de l'Isle, Périgueux", time:"Résidence 9–12 fév · restitution le 12", price:"Sortie de résidence", status:"free", type:"résidence", cardColor:"#3A1B2E", cardTextColor:"#F4E8D5" },
  { day:"16", month:"Fév", year:"2026", title:"Vacarme(s) — Cie Milles Lieues", venue:"Filature de l'Isle, Périgueux", time:"Résidence 16–20 février", price:"Sortie de résidence", status:"free", type:"résidence", cardColor:"#3A1B2E", cardTextColor:"#F4E8D5" },
  { day:"21", month:"Avr", year:"2026", title:"Cycle Ateliers Geste (8–12 ans)", venue:"Odyssée, Périgueux", time:"17h30–19h · 9 séances, avril à juin", price:"Gratuit", status:"free", type:"atelier", cardColor:"#9B7AA8", cardTextColor:"#F4E8D5" },
  { day:"19", month:"Mai", year:"2026", title:"Soirée Focus — Chamiers, Cœur de Ville", venue:"Chamiers", time:"18h00", price:"Voir programme", status:"available", type:"événement", cardColor:"#8E3620", cardTextColor:"#F4E8D5" },
  { day:"16", month:"Juin", year:"2026", title:"Restitution — Cycle Ateliers Geste", venue:"Odyssée, Périgueux", time:"17h30–19h · dernière séance du cycle", price:"Gratuit", status:"free", type:"atelier", cardColor:"#9B7AA8", cardTextColor:"#F4E8D5" },
];

const ATELIERS = [
  { num:"A1", title:"Théâtre Enfants & Ados", who:"6–9 ans / 10–14 ans", when:"Mercredi 14h–15h30 / 16h–17h30", where:"Filature de l'Isle, Périgueux", price:"Adhésion + 60 € / trimestre", color:"#B84A2E", textColor:"#F4E8D5", desc:"Raconter une histoire en mettant en jeu son corps et sa voix. Observer le monde et le traduire scéniquement. Rendre visible l'invisible et oser être présent à soi et aux autres. Sorties aux spectacles incluses. Avec Perrine Marillier.", audience:"enfants" },
  { num:"A2", title:"Cycle d'expérimentation artistique", who:"Adultes", when:"1 samedi par mois, 9h45–16h", where:"Filature de l'Isle, Périgueux", price:"Adhésion + 75 € / trimestre", color:"#3A1B2E", textColor:"#F4E8D5", desc:"Cycle de découvertes, de pratiques et d'expérimentations artistiques. Sorties aux spectacles incluses. Avec Perrine Marillier, Mathieu Duval et Guilhem Loupiac.", audience:"adultes" },
  { num:"A3", title:"Compagnon Vocal", who:"Tous niveaux", when:"Mercredi tous les 15 jours, 11h30–13h", where:"Filature de l'Isle, Périgueux", price:"Adhésion – Gratuit", color:"#E8B542", textColor:"#3A1B2E", desc:"Venez chanter, écouter, vous ressourcer, vibrer. Aucune expérience vocale nécessaire. Avec Claude Danielle Morlet et Dominique Borie-Lagarde.", audience:"adultes" },
  { num:"A4", title:"Expression créatrice", who:"Tous publics", when:"Mardi 14h–16h", where:"Filature de l'Isle, Périgueux", price:"Adhésion – Gratuit", color:"#C89420", textColor:"#3A1B2E", desc:"Atelier d'expérimentation et de création plastique. Explorer sa créativité et son propre imaginaire en groupe. Pratique individuelle, création collective. Sans prérequis technique. Avec Ambre Ludwiczak.", audience:"adultes" },
  { num:"A5", title:"Rdv's du Toulon", who:"Habitants du quartier", when:"Jeudi 14h–16h", where:"Salle du 800 – EVS, Périgueux", price:"Adhésion – Gratuit", color:"#8E3620", textColor:"#F4E8D5", desc:"Rencontres interculturelles & créations collectives : Café Culture, médiations autour des spectacles, ateliers… + Sorties aux spectacles.", audience:"quartier" },
  { num:"A6", title:"Ateliers Geste", who:"8–12 ans", when:"21,28/04 — 5,12,19,26/05 — 2,9,16/06/2026 · 17h30–19h", where:"Odyssée, Périgueux", price:"Gratuit", color:"#9B7AA8", textColor:"#F4E8D5", desc:"Créer et jouer à la frontière du réel et du fantastique. Cycle de 9 séances avec Guilhem Loupiac. En partenariat avec L'Odyssée.", audience:"enfants" },
];

const EQUIPE = [
  { name:"Émilie Esquerré", role:"Comédienne, metteuse en scène", bio:"Rejoint la Cie Rouletabille en 2024-2025 avec une ligne artistique centrée sur la déconstruction des stéréotypes de genre et la critique des systèmes patriarcaux, en écho aux luttes sociales actuelles. « Pour apporter ma petite goutte au moulin de la déconstruction, je passe par le théâtre. »" },
  { name:"Perrine Marillier", role:"Intervenante artistique, chargée de communication", bio:"Anime les ateliers Théâtre Enfants & Ados et co-encadre le Cycle d'expérimentation artistique adultes. Pilier de la médiation artistique au quotidien." },
  { name:"Guilhem Loupiac", role:"Intervenant artistique — Ateliers Geste", bio:"Anime les Ateliers Geste pour les 8–12 ans en partenariat avec L'Odyssée, et participe au Cycle d'expérimentation artistique adultes." },
  { name:"Mathieu Duval", role:"Intervenant artistique", bio:"Co-encadre le Cycle d'expérimentation artistique adultes avec Perrine Marillier et Guilhem Loupiac." },
  { name:"Ambre Ludwiczak", role:"Intervenante — Expression créatrice", bio:"Anime l'atelier Expression créatrice, centré sur les arts plastiques et l'exploration de l'imaginaire. Approche libre et sans prérequis." },
  { name:"Claude Danielle Morlet", role:"Intervenante — Compagnon Vocal", bio:"Co-anime le Compagnon Vocal avec Dominique Borie-Lagarde. Un espace pour chanter, écouter, se ressourcer — ouvert à tous les niveaux." },
  { name:"Dominique Borie-Lagarde", role:"Intervenante — Compagnon Vocal", bio:"Co-anime le Compagnon Vocal. Pratique collective douce, aucune expérience vocale nécessaire." },
  { name:"L'administratrice", role:"Administration & gestion", bio:"Pilote l'administratif et la vie associative. Garante de la bonne santé financière et organisationnelle de la compagnie." },
];

const PARTENAIRES = [
  { name:"Région Nouvelle-Aquitaine", type:"Soutien institutionnel", url:"https://www.nouvelle-aquitaine.fr" },
  { name:"Agence Culturelle de la Dordogne", type:"Soutien institutionnel", url:null },
  { name:"DRAC Nouvelle-Aquitaine", type:"Soutien institutionnel", url:null },
  { name:"Département de la Dordogne", type:"Soutien institutionnel", url:"https://www.dordogne.fr" },
  { name:"Ville de Périgueux", type:"Soutien institutionnel", url:"https://www.perigueux.fr" },
  { name:"L'Odyssée", type:"Partenaires artistiques", url:null },
  { name:"Cie Lilo", type:"Partenaires artistiques", url:null },
  { name:"Cie du Grand Doute", type:"Partenaires artistiques", url:null },
  { name:"Cie Pittoresque", type:"Partenaires artistiques", url:null },
  { name:"Cie 3G", type:"Partenaires artistiques", url:null },
  { name:"Cie Anandi", type:"Partenaires artistiques", url:null },
  { name:"Cie Structure", type:"Partenaires artistiques", url:null },
  { name:"Le Sans Réserve", type:"Action culturelle & territoire", url:null },
  { name:"Maison 24", type:"Action culturelle & territoire", url:null },
  { name:"Maison pour Tous", type:"Action culturelle & territoire", url:null },
  { name:"Centre social St Exupéry", type:"Action culturelle & territoire", url:null },
  { name:"Centre social l'Arche", type:"Action culturelle & territoire", url:null },
  { name:"UPOP24", type:"Action culturelle & territoire", url:null },
  { name:"Conseil Citoyen Chamiers", type:"Action culturelle & territoire", url:null },
  { name:"APF24", type:"Action culturelle & territoire", url:null },
  { name:"UEMO PJJ", type:"Action culturelle & territoire", url:null },
  { name:"CADA FTA", type:"Action culturelle & territoire", url:null },
  { name:"APARE", type:"Action culturelle & territoire", url:null },
  { name:"Hestia", type:"Action culturelle & territoire", url:null },
  { name:"Orizon", type:"Action culturelle & territoire", url:null },
  { name:"Commune de Mensignac", type:"Action culturelle & territoire", url:null },
  { name:"Lycée Léonard de Vinci", type:"Éducation", url:null },
  { name:"Collège Clos Chassaing", type:"Éducation", url:null },
  { name:"IUT de Périgueux", type:"Éducation", url:null },
  { name:"Ligue de l'Enseignement", type:"Éducation", url:"https://www.ligue-enseignement.fr" },
  { name:"Ciné Cinéma", type:"Éducation", url:null },
];

export { SPECTACLES, AGENDA, ATELIERS, EQUIPE, PARTENAIRES };
