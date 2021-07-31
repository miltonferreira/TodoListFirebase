# teste
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

# user modifica somente seus dados
# limite de 30 caracteres para nome e nameLowerCase e somente string
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, delete: if request.auth.uid == uid;
      allow create, update: if request.auth.uid == uid
      	&& request.resource.data.name is string
        && request.resource.data.name.size() <= 30
        && request.resource.data.nameLowerCase is string
        && request.resource.data.nameLowerCase.size() <= 30;
    }
  }
}