# Teste
{
  "rules": {
    ".read": true,  
    ".write": true,  
  }
}

# Bloqueado
{
  "rules": {
    ".read": false,  
    ".write": false,  
  }
}

# Padrão
{
  "rules": {
    ".read": "now < 1629687600000", 
    ".write": "now < 1629687600000", 
  }
}

# Autenticação simples para qualquer usuario
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
  }
}

# Acesso e Modificações restritas ao dono dos dados
{
  "rules": {
    "users": {
     	"$uid": {
        ".read": "$uid == auth.uid",
    		".write": "$uid == auth.uid",
      } 
    }
  }
}

# Acesso e Modificações restritas ao dono dos dados e limita somente string e 30 caracteres
{
  "rules": {
    "users": {
     	"$uid": {
        ".read": "$uid == auth.uid",
    		".write": "$uid == auth.uid",
        "$tid": {
          ".validate": "newData.child('name').isString() && newData.child('name').val().length <= 30",
        }
      } 
    }
  }
}

# +filtragem e ordenação de dados
{
  "rules": {
    "users": {
     	"$uid": {
        ".read": "$uid == auth.uid",
    		".write": "$uid == auth.uid",
        ".indexOn": "nameLowerCase",
        "$tid": {
          ".validate": "newData.child('name').isString() && newData.child('name').val().length <= 30 && newData.child('nameLowerCase').isString() && newData.child('nameLowerCase').val().length <= 30",
        }
      } 
    }
  }
}

# mais sobre indice e segurança
https://firebase.google.com/docs/database/security/indexing-data?hl=pt-br

# forma mais avançada de fazer pesquisa no firebase(>>> elasticsearch <<<)
https://www.elastic.co/pt/what-is/elasticsearch

# Comandos console do Chrome -------------------------------
# add tarefa
dbRefUsers.child('idDoUser').push({'name':'NomeTarefa'})
# atualiza tarefa
dbRefUsers.child('idDoUser').child('idDaTarefa').update({'name':'NomeTarefa'})
# remove tarefa
dbRefUsers.child('idDoUser').child('idDaTarefa').remove()