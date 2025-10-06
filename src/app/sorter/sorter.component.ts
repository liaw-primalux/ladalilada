import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { addDoc, collection, collectionData, doc, getDoc, DocumentReference, Firestore } from '@angular/fire/firestore';
import { onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sorter',
  templateUrl: './sorter.component.html',
  styleUrl: './sorter.component.scss',
  standalone: false,
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
})
export class SorterComponent {
  firestore = inject(Firestore);
  itemCollection = collection(this.firestore, 'sharedTeams');
  // item$ = collectionData(this.itemCollection);

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

  id: string | null = '';
  currentUrlPath = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');

      if (this.id)
        this.loadSharedData(this.id);
    });
  }

  copyToClipboard(): void {
    let listener = (e: ClipboardEvent) => {
      e.clipboardData?.setData('text/plain', (this.currentUrlPath));
      e.preventDefault();
    };
    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
  }

  async saveAndShare() {
    const data = {
      nameList: this.nameList,
      teamSize: this.teamSize,
      mergeRemainders: this.mergeRemainders,
      assignedTeamNames: this.assignedTeamNames,
      teams: this.teams.map(members => ({ members }))
    };

    try {
      var docRef: any;
      if (!this.id) {
        docRef = await addDoc(this.itemCollection, data);
        this.id = docRef.id
        this.router.navigate(['/', docRef.id]);
        this.currentUrlPath = `${document.location.origin}/#/${this.id}`;
      }
      else {
        docRef = await setDoc(doc(this.firestore, 'sharedTeams', this.id), data);
        this.currentUrlPath = document.location.href;
      }

      Swal.fire({
        text: 'Copy the link below and share it with your friends!',
        input: "text",
        inputValue: this.currentUrlPath,
        showCancelButton: true
      }).then((result) => {
        if (result.value) {
          this.copyToClipboard();
        }
      });

    } catch (error) {
      console.log('Error when saving: ' + error);
      let log = {
        data: JSON.stringify(data),
        error: JSON.stringify(error),
        timestamp: serverTimestamp()
      }
      await addDoc(collection(this.firestore, 'errorLogs'), log);
    }
  }

  share() {

  }

  async loadSharedData(id: string) {
    try {
      onSnapshot(doc(this.firestore, "sharedTeams", id), (doc) => {
        if (doc.exists()) {
          const data: any = doc.data();
          this.nameList = data?.nameList || [];
          this.teamSize = data?.teamSize || 2;
          this.teams = (data?.teams || []).map((t: any) => t.members);
          this.assignedTeamNames = data?.assignedTeamNames || [];
        }
      });
    } catch (error) {
      console.log('Error loading shared data: ' + error);
      let log = {
        data: { id: this.id },
        error: JSON.stringify(error),
        timestamp: serverTimestamp()
      }
      await addDoc(collection(this.firestore, 'errorLogs'), log);
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

    if (this.id)
      this.router.navigate(['/', this.id], { fragment: 'results' });
    else
      this.router.navigate(['/'], { fragment: 'results' });
  }

  shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  generateTeamNames() {
    this.assignedTeamNames = [];
    for (let i = 0; i < this.teams.length; i++) {
      while (this.assignedTeamNames.length < this.teams.length) {
        let name = this.teamNamesPool[Math.floor(Math.random() * this.teamNamesPool.length)];
        let nameExists = this.assignedTeamNames.find(x => x == name);
        if (!nameExists)
          this.assignedTeamNames.push(name);
      }
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
    this.router.navigate(['/']);
    this.id = '';
    this.nameInput = '';
    this.nameList = [];
    this.teams = [];
  }
}
