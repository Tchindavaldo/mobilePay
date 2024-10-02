import { Component, OnInit } from '@angular/core';

interface Movie {
  title: string;
  poster: string;
  releaseDate: string;
  description?: string;
  liked?: boolean;
  disliked?: boolean;
}

@Component({
  selector: 'app-actus',
  templateUrl: './actus.component.html',
  styleUrls: ['./actus.component.scss'],
})
export class ActusComponent implements OnInit {
  currentMovies: Movie[] = [
    { title: 'Film 2024', poster: 'assets/../../assets/fiml1.jpg', releaseDate: '2024-01-01', description: 'Description du Film' },
    { title: 'Film 2023', poster: 'assets/../../assets/film2.jpg', releaseDate: '2023-12-15', description: 'Description du Film' },
    { title: 'Film 2023', poster: 'assets/../../assets/fiml3.jpg', releaseDate: '2023-12-15', description: 'Description du Film' },
    { title: 'Film 2023', poster: 'assets/../../assets/film3.jpg', releaseDate: '2023-12-15', description: 'Description du Film' },
  ];
  
  isModalOpen = false;
  selectedMovie: Movie = { title: '', poster: '', releaseDate: '', description: '' };

  constructor() {}

  ngOnInit() {}

  openMovieDetails(movie: Movie) {
    this.selectedMovie = movie;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  likeMovie(movie: Movie) {
    movie.liked = !movie.liked;
    if (movie.liked) {
      // Logique pour enregistrer le like
      console.log(`${movie.title} a été aimé.`);
    }
  }

  dislikeMovie(movie: Movie) {
    movie.disliked = !movie.disliked;
    if (movie.disliked) {
      // Logique pour enregistrer le dislike
      console.log(`${movie.title} a été détesté.`);
    }
  }

  setNotification(movie: Movie) {
    const releaseDate = new Date(movie.releaseDate);
    const today = new Date();
    
    if (releaseDate > today) {
      // Logique pour notifier l'utilisateur
      console.log(`Notification programmée pour ${movie.title} le ${releaseDate}`);
      alert(`Vous serez notifié pour ${movie.title} le ${releaseDate.toDateString()}.`);
    } else {
      alert(`${movie.title} est déjà sorti.`);
    }
  }
}
