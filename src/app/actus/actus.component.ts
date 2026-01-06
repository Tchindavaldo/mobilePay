import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LanguageService } from '../services/language.service';

interface Movie {
  id: number;
  title: string;
  poster: string;
  backdrop: string;
  releaseDate: string;
  description: string;
  genre: string[];
  rating: number;
  duration: string;
  trailer?: string;
  liked?: boolean;
  disliked?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  category: 'trending' | 'new' | 'action' | 'drama' | 'comedy' | 'sci-fi';
}

@Component({
  selector: 'app-actus',
  templateUrl: './actus.component.html',
  styleUrls: ['./actus.component.scss'],
})
export class ActusComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(public langService: LanguageService) {}

  // Film vedette pour la hero section
  featuredMovie: Movie = {
    id: 1,
    title: 'Dune: Part Two',
    poster: 'assets/fiml1.jpg',
    backdrop: 'assets/backg.jpeg',
    releaseDate: '2024-03-15',
    description: 'Paul Atreides s\'unit à Chani et aux Fremen tout en cherchant à se venger des conspirateurs qui ont détruit sa famille. Face à un choix entre l\'amour de sa vie et le destin de l\'univers, il s\'efforce d\'empêcher un terrible futur que lui seul peut prévoir.',
    genre: ['Science-Fiction', 'Aventure', 'Drame'],
    rating: 8.8,
    duration: '2h 46min',
    trailer: 'https://www.w3schools.com/html/mov_bbb.mp4',
    isNew: true,
    isTrending: true,
    category: 'sci-fi'
  };

  // Films par catégories
  trendingMovies: Movie[] = [
    {
      id: 2,
      title: 'Oppenheimer',
      poster: 'assets/film2.jpg',
      backdrop: 'assets/bacf1.jpeg',
      releaseDate: '2024-01-20',
      description: 'L\'histoire de J. Robert Oppenheimer et son rôle dans le développement de la bombe atomique.',
      genre: ['Drame', 'Histoire', 'Thriller'],
      rating: 8.5,
      duration: '3h 00min',
      trailer: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isTrending: true,
      category: 'drama'
    },
    {
      id: 3,
      title: 'Spider-Man: Across the Spider-Verse',
      poster: 'assets/fiml3.jpg',
      backdrop: 'assets/bac.jpeg',
      releaseDate: '2024-02-10',
      description: 'Miles Morales revient pour une nouvelle aventure épique à travers le multivers.',
      genre: ['Animation', 'Action', 'Aventure'],
      rating: 9.0,
      duration: '2h 20min',
      trailer: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isTrending: true,
      category: 'action'
    },
    {
      id: 4,
      title: 'The Batman',
      poster: 'assets/film3.jpg',
      backdrop: 'assets/fond.jpeg',
      releaseDate: '2024-01-05',
      description: 'Une nouvelle interprétation sombre du chevalier noir de Gotham.',
      genre: ['Action', 'Crime', 'Drame'],
      rating: 8.2,
      duration: '2h 56min',
      trailer: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isTrending: true,
      category: 'action'
    }
  ];

  newReleases: Movie[] = [
    {
      id: 5,
      title: 'Avatar: The Way of Water',
      poster: 'assets/film6.jpg',
      backdrop: 'assets/backg.jpeg',
      releaseDate: '2024-03-01',
      description: 'Jake Sully et sa famille explorent les océans de Pandora.',
      genre: ['Science-Fiction', 'Aventure', 'Action'],
      rating: 8.1,
      duration: '3h 12min',
      isNew: true,
      category: 'sci-fi'
    },
    {
      id: 6,
      title: 'Top Gun: Maverick',
      poster: 'assets/fiml1.jpg',
      backdrop: 'assets/bac.jpeg',
      releaseDate: '2024-02-28',
      description: 'Pete "Maverick" Mitchell revient pour une mission impossible.',
      genre: ['Action', 'Drame'],
      rating: 8.7,
      duration: '2h 11min',
      isNew: true,
      category: 'action'
    }
  ];

  selectedCategory: string = 'all';
  isModalOpen = false;
  isTrailerPlaying = false;
  selectedMovie: Movie = this.featuredMovie;


  ngOnInit() {}

  t(key: string): string {
    return this.langService.translate(key);
  }

  // Gestion des catégories
  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  getMoviesByCategory(): Movie[] {
    switch (this.selectedCategory) {
      case 'trending':
        return this.trendingMovies;
      case 'new':
        return this.newReleases;
      case 'all':
      default:
        return [...this.trendingMovies, ...this.newReleases];
    }
  }

  // Gestion des modals et trailers
  openMovieDetails(movie: Movie) {
    this.selectedMovie = movie;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.stopTrailer();
  }

  playTrailer(movie: Movie) {
    if (movie.trailer) {
      this.selectedMovie = movie;
      this.isTrailerPlaying = true;
      this.isModalOpen = true;
    }
  }

  stopTrailer() {
    this.isTrailerPlaying = false;
    if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.pause();
      this.videoPlayer.nativeElement.currentTime = 0;
    }
  }

  // Actions utilisateur
  likeMovie(movie: Movie, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    movie.liked = !movie.liked;
    if (movie.liked && movie.disliked) {
      movie.disliked = false;
    }
    console.log(`${movie.title} ${movie.liked ? 'aimé' : 'like retiré'}`);
  }

  dislikeMovie(movie: Movie, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    movie.disliked = !movie.disliked;
    if (movie.disliked && movie.liked) {
      movie.liked = false;
    }
    console.log(`${movie.title} ${movie.disliked ? 'détesté' : 'dislike retiré'}`);
  }

  setNotification(movie: Movie, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const releaseDate = new Date(movie.releaseDate);
    const today = new Date();
    
    if (releaseDate > today) {
      console.log(`Notification programmée pour ${movie.title} le ${releaseDate}`);
      // Ici vous pouvez intégrer votre service de notifications
    } else {
      console.log(`${movie.title} est déjà sorti.`);
    }
  }

  // Utilitaires
  getStarRating(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 1;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('star');
    }
    if (hasHalfStar) {
      stars.push('star-half');
    }
    while (stars.length < 5) {
      stars.push('star-outline');
    }
    return stars;
  }

  formatReleaseDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Méthode pour basculer les filtres (pour le bouton dans le header)
  toggleFilters(): void {
    // Pour l'instant, on peut simplement faire défiler vers les filtres
    const filtersSection = document.querySelector('.filters-section');
    if (filtersSection) {
      filtersSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Navigation
  goBack(): void {
    window.history.back();
  }
}
