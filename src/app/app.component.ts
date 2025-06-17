import { Component } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('teamAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  standalone: false
})
export class AppComponent {
  teamNamesPool = [
    // 🧙‍♂️ Harry Potter
    'Gryffindor', 'Slytherin', 'Hufflepuff', 'Ravenclaw',
    'Order of the Phoenix', 'Death Eaters', 'Dumbledore’s Army',

    // 🌌 Star Wars
    'Jedi Order', 'Sith Lords', 'Rebel Alliance', 'Galactic Empire',
    'The Mandalorians', 'Clone Troopers', 'Stormtroopers',

    // 🦸‍♂️ Marvel
    'Avengers', 'X-Men', 'Guardians of the Galaxy', 'Wakanda Warriors',
    'S.H.I.E.L.D.', 'Hydra', 'Team Iron Man', 'Team Cap',

    // 🧙‍♂️ Lord of the Rings
    'Fellowship of the Ring', 'Riders of Rohan', 'Elves of Lothlórien',
    'Orcs of Mordor', 'Gondor Defenders', 'Hobbits of the Shire',

    // ⚡ Pokémon
    'Team Rocket', 'Team Mystic', 'Team Valor', 'Team Instinct',
    'Elite Four', 'Kanto Trainers', 'Johto Masters',

    // 🎮 Video Games
    'Hyrule Heroes', 'Mushroom Kingdom', 'Spartan Squad', 'Vault Dwellers',
    'Covenant Crushers', 'Overwatch Unit', 'Ghost Recon',

    // 🐉 Fantasy/Anime
    'Dragon Slayers', 'Ninjas of Konoha', 'Akatsuki', 'Survey Corps',
    'Demon Slayers', 'Titanslayers', 'Alchemists of Amestris',

    // ⚔️ Game of Thrones
    'House Stark', 'House Lannister', 'House Targaryen', 'Night’s Watch',
    'Wildlings', 'Kingsguard',

    // 👽 Sci-Fi
    'The Expanse Crew', 'Battlestar Galactica', 'Cyberdyne Squad',
    'Weyland-Yutani', 'Matrix Agents', 'Andromeda Alliance',

    // 🧟 Zombie/Apocalypse
    'Survivors', 'The Infected', 'The Resistance', 'Zombie Slayers',

    // 🏴 Pirate & Nautical
    'Blackbeard’s Crew', 'Flying Dutchman', 'Kraken Hunters',
    'Pirates of the Azure Sea',

    // 🐾 Misc Cool
    'Shadow Wolves', 'Crimson Falcons', 'Iron Fangs', 'Frost Giants',
    'Storm Riders', 'Night Howlers', 'Fire Hawks', 'Venom Vipers'
  ];

  teamGradients: string[] = [
    'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
  ];


  nameInput = '';
  teamSize = 2;
  nameList: string[] = [];
  teams: string[][] = [];
  mergeRemainders: boolean = false;

  assignedTeamNames: string[] = [];

  constructor(
    private firestore: AngularFirestore,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      console.log(params.get('id'))
    });

    // Check URL for shared ID param, e.g. ?id=xyz
    this.route.queryParams.subscribe(params => {
      const sharedId = params['id'];
      console.log(params)
      if (sharedId) {
        // this.loadSharedData(sharedId);
      }
    });
  }

  async saveAndShare() {
    const data = {
      nameList: this.nameList,
      teamSize: this.teamSize,
      teams: this.teams,
      mergeRemainders: this.mergeRemainders,
      assignedTeamNames: this.assignedTeamNames
    };

    try {
      console.log('here')
      // Save data to Firestore collection "sharedTeams"
      const docRef = await this.firestore.collection('sharedTeams').add(data);

      // Build share URL with document ID
      // const shareUrl = `${window.location.origin}${window.location.pathname}?id=${docRef.id}`;

      // Optionally update URL in browser without reloading
      this.router.navigate([], { queryParams: { id: docRef.id }, replaceUrl: true });
    } catch (error) {
      console.log(error);
    }
  }

  async loadSharedData(id: string) {
    try {
      const doc = await this.firestore.collection('sharedTeams').doc(id).ref.get();
      if (doc.exists) {
        const data: any = doc.data();
        this.nameList = data?.nameList || [];
        this.teamSize = data?.teamSize || 2;
        this.teams = data?.teams || [];
        this.assignedTeamNames = data?.assignedTeamNames || [];
      } else {
        console.log('Shared data not found.');
      }
    } catch (error) {
      console.log('Error loading shared data: ' + error)
    }
  }

  addName() {
    const trimmed = this.nameInput.trim();
    if (trimmed) {
      this.nameList.push(trimmed);
      this.nameInput = '';
    }
  }

  shuffleAndGroup() {
    const names = [...this.nameList];
    this.shuffleArray(names);

    const teams: string[][] = [];
    const totalTeams = Math.floor(names.length / this.teamSize);
    let index = 0;

    for (let i = 0; i < totalTeams; i++) {
      teams.push(names.slice(index, index + this.teamSize));
      index += this.teamSize;
    }

    const leftovers = names.slice(index);

    if (leftovers.length > 0) {
      if (this.mergeRemainders) {
        // Add leftovers to random existing teams
        leftovers.forEach(name => {
          const randomTeam = teams[Math.floor(Math.random() * teams.length)];
          randomTeam.push(name);
        });
      } else {
        // Leave leftovers in a new team
        teams.push(leftovers);
      }
    }

    this.teams = teams;
    this.generateTeamNames();
  }

  shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  generateTeamNames() {
    const usedNames = new Set<string>();
    for (let i = 0; i < this.teams.length; i++) {
      let name: string;
      const maxTries = 100;
      let tries = 0;
      do {
        name = this.teamNamesPool[Math.floor(Math.random() * this.teamNamesPool.length)];
        tries++;
      } while (usedNames.has(name) && tries < maxTries);

      usedNames.add(name);
      this.assignedTeamNames.push(name);
    }
  }

  getInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return words[0][0].toUpperCase() + words[1][0].toUpperCase();
  }

  removeName(index: number) {
    this.nameList.splice(index, 1);
  }

  clearAll() {
    this.nameInput = '';
    this.nameList = [];
    this.teams = [];
  }
}
