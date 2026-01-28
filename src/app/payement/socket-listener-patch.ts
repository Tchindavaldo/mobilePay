// Ajoutez ce code dans setupSocketListeners() après le listener payment_validated

// 2. Création de l'activation (Enregistré en base)
this.socket.on('activationcreated', (data: any) => {
       console.log('📝 Socket: activationcreated reçu:', data);
       if (data.success && data.data) {
              // Passage à l'étape 3 : Activation en cours
              this.verificationStep = 3;
              this.presentSuccessToast('Activation de l\'abonnement en cours...');
              
              // Passer à la page de succès après un court délai
              setTimeout(() => {
                     this.page = 6;
              }, 2000);
       }
});
