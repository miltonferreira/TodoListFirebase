// pega botoes do html ----------------------------------------
var authForm = document.getElementById('authForm');
var authFormTitle = document.getElementById('authFormTitle');

var register = document.getElementById('register');
var access = document.getElementById('access');

var loading = document.getElementById('loading');

var auth = document.getElementById('auth');

var userContent = document.getElementById('userContent');

var userEmail = document.getElementById('userEmail');

// verificação de email --------------------------------------------------------------------
var sendEmailVerificationDiv = document.getElementById('sendEmailVerificationDiv');
var emailVerified = document.getElementById('emailVerified');

// reseta senha ----------------------------------------------
var passwordReset = document.getElementById('passwordReset');

// login Google -------------------------------------------
var userName = document.getElementById('userName');
var userImg = document.getElementById('userImg');

// formulario de TodoList -------------------------------------------------------
var todoForm = document.getElementById('todoForm');

// mostra as tarefas do user ----------------------------------------------------
var todoCount = document.getElementById('todoCount');
var ulTodoList = document.getElementById('ulTodoList');

// pesquisa de tarefas do User ----------------------------------------------------
var search = document.getElementById('search');

// barra de progresso -------------------------------------------------------------
var progressFeedback = document.getElementById('progressFeedback');
var progress = document.getElementById('progress');

// botão de pausar ---------------------------------------
var playPauseBtn = document.getElementById('playPauseBtn');

// botão de cancelar ---------------------------------------
var cancelBtn = document.getElementById('cancelBtn');

// modifica tarefa ---------------------------------------------------
var cancelUpdateTodo = document.getElementById('cancelUpdateTodo');
var todoFormTitle = document.getElementById('todoFormTitle');


// altera o formulario de auth para cadastro de nova conta ----
function toggleToRegister(){
    authForm.submitAuthForm.innerHTML = 'Cadastrar Conta';
    authFormTitle.innerHTML = 'Insira seus dados para cadastrar';

    hideItem(passwordReset);
    hideItem(register);
    showItem(access);
}

// altera o formulario de auth para acessar conta ----
function toggleToAccess(){
    authForm.submitAuthForm.innerHTML = 'Acessar';
    authFormTitle.innerHTML = 'Acesse sua conta para continuar';

    hideItem(access);
    showItem(passwordReset);
    showItem(register);
}

function showItem(element){
    element.style.display = 'block';
}

function hideItem(element){
    element.style.display = 'none';
}

// logado
function showUserContent(user){

    userEmail.innerHTML = user.email;

    // Ao logar com Google
    userImg.src = user.photoURL ? user.photoURL : 'img/unknownUser.png';
    userName.innerHTML = user.displayName ? user.displayName : 'Novo Usuário';

    if(user.providerData[0].providerId != 'password'){
        emailVerified.innerHTML = 'Autentificação Confiável';
        hideItem(sendEmailVerificationDiv);
    }else{
        if(user.emailVerified){
            emailVerified.innerHTML = 'Email Verificado';
            hideItem(sendEmailVerificationDiv);
        } else {
            emailVerified.innerHTML = 'Email Não Verificado';
            showItem(sendEmailVerificationDiv);
        }
    }

    hideItem(auth);         //  se logado esconde elementos de login

    getDefaultTodoList();   // mostra tarefas do user salvos no realtimeDatabase
    
    // se user pesquisar
    search.onkeyup = (()=>{
        if(search.value != ''){

            var searchText = search.value.toLowerCase();
            
            // filtra somente uma vez (once/get)
            dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas')
                .orderBy('nameLowerCase')
                .startAt(searchText).endAt(searchText + '\uf8ff')
                .get().then((dataSnapshot)=>{
                    fillTodoList(dataSnapshot);
                });

            // referencia para realtime database ------------------
            // dbRefUsers.child(user.uid)
            // .orderByChild('nameLowerCase')                           // ordena as tarefas pelo nome
            // .startAt(searchText).endAt(searchText + '\uf8ff')        // delimita o resultado(nome de tarefas pesquisado)
            // .once('value').then((dataSnapshot)=>{
            //     fillTodoList(dataSnapshot);                          // busca taregas filtradas somente uma vez
            // });

        } else {searchText
            getDefaultTodoList();   // mostra tarefas do user salvos no realtimeDatabase
        }
    });

    showItem(userContent);  //  mostra elementos de user logado
}

// busca as tarefas no Realtime Database (listagem padrão)
function getDefaultTodoList(){
    
    // onSnapshot recupera em tempo real no firestore
    dbFirestore.doc(firebase.auth().currentUser.uid).collection('tarefas')
        .orderBy('nameLowerCase').onSnapshot((dataSnapshot)=>{
            fillTodoList(dataSnapshot);
        });

    // referencia para realtime database ------------------
    // on monitora mudanças nos dados do user
    // dbRefUsers.child(firebase.auth().currentUser.uid)
    // .orderByChild('nameLowerCase')                               // ordena as tarefas pelo nome
    // .on('value', (dataSnapshot)=>{
    //     fillTodoList(dataSnapshot);
    // });
}

// nao logado
function showAuth(){
    showItem(auth);         //  se nao logado mostra elementos de login
    hideItem(userContent);  //  nao mostra elementos de user logado
}

// centraliza os errors
function showError(prefix, error){

    console.log(error.code);    // pega o codigo do error
    hideItem(loading);

    switch (error.code) {
        case 'auth/invalid-email':
        case 'auth/wrong-password':
            alert(prefix + ' ' + 'Email ou Senha inválidas!');
            break;
        case 'auth/weak-password':
            alert(prefix + ' ' + 'Senha deve conter ao menos 6 caracteres!');
            break;
        case 'auth/email-already-in-use':
            alert(prefix + ' ' + 'Email em uso por outro usuário!');
            break;
        case 'auth/popup-closed-by-user':
            alert(prefix + ' ' + 'Popup de autenticação fechado antes da verificação ser concluida!');
            break;
        case 'auth/requires-recent-login':
            alert(prefix + ' ' + 'Faça logout e login novamente para excluir conta!');
            break;
        case 'storage/canceled':
            console.log("Upload Cancelado!");
            break;
        case 'storage/unauthorized':
            alert(prefix + ' ' + 'Falha de acesso!');
            break;
        default: 
            alert(prefix + ' ' + error.message);
    }
}

// redireciona quando autenticar email, fica em sendEmailVerification()
var actionCodeSettings = {
    url: 'https://todolist-ee03a.firebaseapp.com'
}

//antigo
// var actionCodeSettings = {
//     url: 'http://localhost:8080/index.html'
// }

// referencia para realtime database -------------------------------------
var database = firebase.database();
var dbRefUsers = database.ref('users'); // pega ou cria lista de usuarios

// referencia para firestore database -------------------------------------
var dbFirestore = firebase.firestore().collection('users')