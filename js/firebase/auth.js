
firebase.auth().languageCode = 'pt-BR'; // tradução PT-BR

authForm.onsubmit = function (event){
    showItem(loading);  // esconde gif de loading
    event.preventDefault(); // não deixa redirecionar página
    if(authForm.submitAuthForm.innerHTML == 'Acessar'){
        firebase.auth().signInWithEmailAndPassword(authForm.email.value, authForm.password.value).catch((error) => {
            showError('Falha no acesso: ', error);
        });
    } else {
        firebase.auth().createUserWithEmailAndPassword(authForm.email.value, authForm.password.value).then((user)=>{
            // console.log('Cadastrou com sucesso');
            // console.log(user);
        }).catch((error) => {
            showError('Falha no cadastro: ', error);
        });
    }
}

// verifica se tem user logado ou nao
firebase.auth().onAuthStateChanged((user) =>{

    hideItem(loading);  // esconde gif de loading

    if(user){
        showUserContent(user);  // se tiver logado
        //console.log(user);
    } else {
        showAuth();         // se nao tiver logado
    }
});

// logout do user
function signOut(){
    
    clearForm();    // limpa os campos de login e senha do user

    firebase.auth().signOut().catch((error)=>{
        showError('Falha ao sair da conta: ', error);
    });
}

function clearForm(){
    // limpa os campos de login e senha do user
    authForm.email.value = '';
    authForm.password.value = '';
}

// faz verificação do email do novo user
function sendEmailVerification(){

    showItem(loading);

    var user = firebase.auth().currentUser; // pega user logado

    user.sendEmailVerification(actionCodeSettings).then(()=>{
        alert('Email de verificação enviado para ' + user.email + ' Verifique seu email');
    }).catch((error)=>{
        showError('Falha ao enviar email: ', error);
    }).finally(()=>{
        hideItem(loading);
    });
}

// permite user redefinir senha
function sendPasswordResetEmail(){
    var email = prompt('Redefinir senha! Informe Email.', authForm.email.value);
    if(email){
        showItem(loading);
        firebase.auth().sendPasswordResetEmail(email, actionCodeSettings).then(()=>{
            alert('Email de redefinição de senha enviado para ' + email + '.');
        }).catch((error)=>{
            showError('Falha ao enviar redefinição de senha: ', error);
        }).finally(()=>{
            hideItem(loading);
        });
    }else{
        alert('Insira o email no campo email!');
    }
}

// autenticações -----------------------------------------------------------
// se logar novamente o onAuthStateChanged() checa o login
function signInWithGoogle(){
    showItem(loading);
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch((error)=>{  // abre um popup
    //firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider()).catch((error)=>{ // redireciona para pagina de login do google
        showError('Falha ao autenticar com Google: ', error);
        hideItem(loading);
    });
}

function signInWithGitHub(){
    showItem(loading);
    firebase.auth().signInWithPopup(new firebase.auth.GithubAuthProvider()).catch((error)=>{  // abre um popup
    //firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider()).catch((error)=>{ // redireciona para pagina de login do google
        showError('Falha ao autenticar com GitHub: ', error);
        hideItem(loading);
    });
}

function signInWithFacebook(){
    showItem(loading);
    firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider()).catch((error)=>{  // abre um popup
    //firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider()).catch((error)=>{ // redireciona para pagina de login do google
        showError('Falha ao autenticar com Facebook: ', error);
        hideItem(loading);
    });
}

// atualiza infos do user
function updateUserName(){
    
    var newUserName = prompt('Informe novo nome.', userName.innerHTML);

    if(newUserName && newUserName!=''){

        userName.innerHTML = newUserName;
        showItem(loading);

        var user = firebase.auth().currentUser; // pega user logado

        user.updateProfile({
            displayName: newUserName
        }).catch((error)=>{
            showError('Falha ao atualizar informações do usuário: ', error);
        }).finally(()=>{
            hideItem(loading);
        });

    }else{
        alert('O nome de usuário não pode ser vazio!');
    }
}

// exclui conta do user
function deleteUserAccount(){

    var confirmation = confirm('Deseja Excluir Conta?');

    if(confirmation){
        showItem(loading);
        firebase.auth().currentUser.delete().then(()=>{
            alert('Conta Excluida!');
        }).catch((error)=>{
            showError('Falha ao excluir usuário: ', error);
        }).finally(()=>{
            hideItem(loading);
            clearForm();    // limpa os campos de login e senha do user
        });
    }
}