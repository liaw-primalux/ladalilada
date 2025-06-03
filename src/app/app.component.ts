import { Component } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

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
  ]
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

  assignedTeamNames: string[] = [];

  addName() {
    const trimmed = this.nameInput.trim();
    if (trimmed) {
      this.nameList.push(trimmed);
      this.nameInput = '';
    }
  }

  shuffleAndGroup() {
    const shuffled = [...this.nameList];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    this.teams = [];
    this.assignedTeamNames = [];

    const fullTeamCount = Math.floor(shuffled.length / this.teamSize);
    const leftoverCount = shuffled.length % this.teamSize;

    // Create full teams
    let index = 0;
    for (let i = 0; i < fullTeamCount; i++) {
      const team = shuffled.slice(index, index + this.teamSize);
      this.teams.push(team);
      index += this.teamSize;
    }

    // Add leftovers into random teams
    const leftovers = shuffled.slice(index);
    for (const name of leftovers) {
      const randomTeamIndex = Math.floor(Math.random() * this.teams.length);
      this.teams[randomTeamIndex].push(name);
    }

    // Assign team names
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
