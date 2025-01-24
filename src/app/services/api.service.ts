import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';

@Injectable( {
       providedIn: 'root',
} )
export class ApiService
{
       private axiosInstance: AxiosInstance;
       private endpoint = 'http://localhost:3000/api/fill-form'; // Endpoint complet


       constructor ()
       {
              // Configuration de l'instance Axios
              this.axiosInstance = axios.create( {

                     headers: {
                            'Content-Type': 'application/json',
                     },
              } );
       }

       // Méthode GET
       async getData(): Promise<any>
       {
              try
              {
                     const response = await this.axiosInstance.get( this.endpoint );
                     return response.data;
              } catch ( error )
              {
                     this.handleError( error );
              }
       }

       // Méthode POST
       async postData( data: any ): Promise<any>
       {
              try
              {
                     const response = await this.axiosInstance.post( this.endpoint, data );
                     return response.data;
              } catch ( error )
              {
                     this.handleError( error );
              }
       }

       // Gestion des erreurs
       private handleError( error: any ): void
       {
              console.error( 'Erreur API:', error );
              throw error; // Tu peux personnaliser la gestion des erreurs ici
       }
}
