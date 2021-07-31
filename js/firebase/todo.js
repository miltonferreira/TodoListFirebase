// trata a envio do formulario ao realtime database -----------------------------------
todoForm.onsubmit = ((event)=>{
    event.preventDefault(); // nao deixa redirecionar pagina

    if(todoForm.name.value != ''){

        var file = todoForm.file.files[0];  // pega a imagem

        // upload de arquivos
        if(file !=null){
            if(file.type.includes('image')){                                                            // verifica se é uma imagem

                // se maior que 2 Mbs
                if(file.size > 1024 * 1024 * 2){
                    alert('Imagem maior que 2 MBs! Imagem tem ' + (file.size / 1024 / 1014).toFixed(3) + ' MBs');
                    return;
                }

                var imgName = firebase.database().ref().push().key + '-' + file.name;                   // gera uma chave para img
                var imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName;       // pasta do user

                var storageRef = firebase.storage().ref(imgPath);   //referencia de arquivo com caminho

                var upload = storageRef.put(file);                  // envia arquivo para o storage

                // monitora o upload esperando o upload ser concluido
                trackUpload(upload).then(()=>{

                    // recebe a url de download da imagem
                    storageRef.getDownloadURL().then((downloadURL)=>{

                        var data = {
                            imgUrl: downloadURL,
                            name: todoForm.name.value,
                            nameLowerCase: todoForm.name.value.toLowerCase()
                        }
                
                        completeTodoCreate(data);   // completa criação da tarefa

                    });

                }).catch((error)=>{
                    showError('Falha ao adicionar tarefa: ', error);
                });

            }else{
                alert('Envie somente imagens!');
            }
        } else {
            // salva tarefa sem imagem
            var data = {
                name: todoForm.name.value,
                nameLowerCase: todoForm.name.value.toLowerCase()
            }
    
            completeTodoCreate(data);   // completa criação da tarefa
        }

    } else {
        alert('Tarefa vazia ou incompleta');
    }
});

// completa criação da tarefa
function completeTodoCreate(data){

    // recurso do realtime firestore -------------------------------------------
    dbFirestore.doc(firebase.auth().currentUser.uid)
        .collection('tarefas').add(data).then(()=>{
            alert('Tarefa "'+ data.name +'" adicionada!');
        }).catch((error)=>{
            showError('Falha ao adicionar tarefa: ', error);
        });

    // recurso do realtime database -------------------------------------------
    // dbRefUsers.child(firebase.auth().currentUser.uid).push(data).then(()=>{
                
    //     todoForm.name.value = '';   // limpa o campo de texto

    //     alert('Tarefa "'+ data.name +'" adicionada!');
    // }).catch((error)=>{
    //     showError('Falha ao adicionar tarefa: ', error);
    // });

    todoForm.name.value = '';   // limpa o campo de texto
    todoForm.file.value = '';   // limpa campo de upload de imagem
}

// rastreia progresso de upload
function trackUpload(upload){

    return new Promise((resolve, reject) => {

        showItem(progressFeedback);     // mostra a barra de progresso

        upload.on('state_changed', (snapshot)=>{
            //console.log(snapshot);  // mostra infos do snapshot
            //console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100).toFixed(2) + '%');
            progress.value = snapshot.bytesTransferred / snapshot.totalBytes * 100;
        },(error)=>{
            // se houve error retorna o erro
            //showError('Falha ao enviar imagem: ', error);
            hideItem(progressFeedback); // esconde barra de progresso
            reject(error);
        },()=>{
            // se fazer upload com sucesso
            console.log("Sucesso ao enviar imagem!");
            hideItem(progressFeedback); // esconde barra de progresso
            resolve();
        });
    
        // pausa upload ----------------------------------
        var playPauseUpload = true;
        playPauseBtn.onclick = (()=>{
            playPauseUpload = !playPauseUpload; // toggle do estado de upload
    
            if(playPauseUpload){
                upload.resume();    // continua fazendo upload da image
                playPauseBtn.innerHTML = 'Pausar';
            }else{
                upload.pause();     // pausa upload da imagem
                playPauseBtn.innerHTML = 'Continuar';
            }
        });
    
        // cancela upload ---------------------------------
        cancelBtn.onclick = (()=>{
            upload.cancel();            // cancela upload
            hideItem(progressFeedback); // esconde barra de progresso
            resetTodoForm();            // reseta para interface de add tarefa
        });
    });

}

// exibe infos com lista de tarefas do user -----------------------------------------
function fillTodoList(dataSnapshot){
    ulTodoList.innerHTML = '';  // limpa lista a cada nova atualização
    
    var num = dataSnapshot.size;
    
    // exibe o numero de tarefas
    todoCount.innerHTML = num + (num > 1 ? ' tarefas':' tarefa') + ':';
    // percorre os elementos do dataSnapshot
    dataSnapshot.forEach((item) => {
        var value = item.data();

        var li = document.createElement('li');
        li.id = item.id;   // recebe o id e adiciona item

        // configura imagem da tarefa ----------------------------------------
        var imgLi = document.createElement('img');
        imgLi.src = value.imgUrl ? value.imgUrl : 'img/defaultTodo.png';
        imgLi.setAttribute('class', 'imgTodo');
        li.appendChild(imgLi);

        var spanLi = document.createElement('span');
        
        spanLi.appendChild(document.createTextNode(value.name));    // add o texto da tarefa

        li.appendChild(spanLi);     // add o span em li

        // remove tarefas -------------------------------------------
        var liRemoveBtn = document.createElement('button');                         // btn para deletar tarefa
        liRemoveBtn.appendChild(document.createTextNode('Excluir'));                // texto do botão
        liRemoveBtn.setAttribute('onclick', 'removeTodo(\"' + item.id + '\")');    // configura a function do botão
        liRemoveBtn.setAttribute('class', 'danger todoBtn');                        // define estilo do botão

        li.appendChild(liRemoveBtn);    // add botão de excluir

        // atualiza tarefas -------------------------------------------
        var liUpdateBtn = document.createElement('button');                         // btn para deletar tarefa
        liUpdateBtn.appendChild(document.createTextNode('Editar'));                 // texto do botão
        liUpdateBtn.setAttribute('onclick', 'updateTodo(\"' + item.id + '\")');    // configura a function do botão
        liUpdateBtn.setAttribute('class', 'alternative todoBtn');                        // define estilo do botão

        li.appendChild(liUpdateBtn);    // add botão de editar

        ulTodoList.appendChild(li);     // add li dentro do ul

    });
}

// exibe infos com lista de tarefas do user -----------------------------------------
function fillTodoListRealtime(dataSnapshot){
    ulTodoList.innerHTML = '';  // limpa lista a cada nova atualização

    var num = dataSnapshot.numChildren(); // realtime database
    
    // exibe o numero de tarefas
    todoCount.innerHTML = num + (num > 1 ? ' tarefas':' tarefa') + ':';
    // percorre os elementos do dataSnapshot
    dataSnapshot.forEach((item) => {
        var value = item.val();

        var li = document.createElement('li');
        li.id = item.key;   // recebe o id e adiciona a key do item

        // configura imagem da tarefa ----------------------------------------
        var imgLi = document.createElement('img');
        imgLi.src = value.imgUrl ? value.imgUrl : 'img/defaultTodo.png';
        imgLi.setAttribute('class', 'imgTodo');
        li.appendChild(imgLi);

        var spanLi = document.createElement('span');
        
        spanLi.appendChild(document.createTextNode(value.name));    // add o texto da tarefa

        li.appendChild(spanLi);     // add o span em li

        // remove tarefas -------------------------------------------
        var liRemoveBtn = document.createElement('button');                         // btn para deletar tarefa
        liRemoveBtn.appendChild(document.createTextNode('Excluir'));                // texto do botão
        liRemoveBtn.setAttribute('onclick', 'removeTodo(\"' + item.key + '\")');    // configura a function do botão
        liRemoveBtn.setAttribute('class', 'danger todoBtn');                        // define estilo do botão

        li.appendChild(liRemoveBtn);    // add botão de excluir

        // atualiza tarefas -------------------------------------------
        var liUpdateBtn = document.createElement('button');                         // btn para deletar tarefa
        liUpdateBtn.appendChild(document.createTextNode('Editar'));                 // texto do botão
        liUpdateBtn.setAttribute('onclick', 'updateTodo(\"' + item.key + '\")');    // configura a function do botão
        liUpdateBtn.setAttribute('class', 'alternative todoBtn');                        // define estilo do botão

        li.appendChild(liUpdateBtn);    // add botão de editar

        ulTodoList.appendChild(li);     // add li dentro do ul

    });
}

// remove tarefa do realtime database --------------------------------
// identifica tarefa pela chave/key
function removeTodo(key){

    //var selectedItem = document.getElementById(key);
    var todoName = document.querySelector('#' + key + ' > span');   // pega o nome da tarefa
    var todoImg = document.querySelector('#' + key + ' > img');     // pega a imagem da tarefa

    var confirmation = confirm('Deseja excluir tarefa \"' + todoName.innerHTML +'\"?');

    if(confirmation){

        dbFirestore.doc(firebase.auth().currentUser.uid)
            .collection('tarefas').doc(key).delete().then(()=>{
                removeFile(todoImg.src);    // remove image da tarefa no storage
            }).catch((error)=>{
                showError('Falha ao remover tarefa', error);
            });

        // recursos do realtime database ------------------------------------------------
        // dbRefUsers.child(firebase.auth().currentUser.uid).child(key).remove().then(()=>{
        //     removeFile(todoImg.src);    // remove image da tarefa no storage
        // }).catch((error)=>{
        //     showError('Falha ao remover tarefa', error);
        // });
    }
}
// remove arquivos do storage
function removeFile(imgUrl){
    console.log(imgUrl);
    
    var result = imgUrl.indexOf('img/defaultTodo.png'); // verifica se é a imagem padrão

    // se for -1 indica que é imagem upada do user
    if(result == -1){
        firebase.storage().refFromURL(imgUrl).delete().then(()=>{
            console.log('Imagem removida do storage');
        }).catch((error) =>{
            console.log(error);
        });
    } else {
        console.log('Imagem Padrão não é removida');
    }
}

// interface para editar tarefa --------------------------------
var updateTodoKey = null;   // recebe o id da tarefa
function updateTodo(key){
    updateTodoKey = key;
    var todoName = document.querySelector('#' + key + ' > span');
    todoFormTitle. innerHTML = '<strong>Editar a tarefa</strong>: ' + todoName.innerHTML;     // altera o titulo do formulario de tarefas
    todoForm.name.value = todoName.innerHTML;                                               // altera o texto da entrada de nome

    hideItem(todoForm.submitTodoForm);       // esconde botão de adicionar tarefa
    showItem(cancelUpdateTodo);     // mostra botão de cancelar edição
}

// reseta para interface de add tarefa ------------------------------------------
function resetTodoForm(){
    todoFormTitle.innerHTML = 'Adicionar tarefa:';
    hideItem(cancelUpdateTodo);                 // esconde botão de cancelar

    todoForm.submitTodoForm.style.display = 'initial';   // mostra botão de adicionar tarefa

    // limpa campos de nome da tarefa e upload de imagem
    todoForm.name.value = '';
    todoForm.file.value = '';
}

// atualiza tarefa ----------------
function confirmTodoUpdate(){
    
    if(todoForm.name.value != ''){
        
        var todoImg = document.querySelector('#' + updateTodoKey + ' > img');       // pega a imagem antiga da tarefa

        var file = todoForm.file.files[0];                                          // pega a imagem

        // upload de arquivos
        if(file !=null){

            // se maior que 2 Mbs
            if(file.size > 1024 * 1024 * 2){
                alert('Imagem maior que 2 MBs! Imagem tem ' + (file.size / 1024 / 1014).toFixed(3) + ' MBs');
                return;
            }

            hideItem(cancelUpdateTodo);

            if(file.type.includes('image')){                                                            // verifica se é uma imagem
                var imgName = firebase.database().ref().push().updateTodoKey + '-' + file.name;                   // gera uma chave para img
                var imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName;      // pasta do user

                var storageRef = firebase.storage().ref(imgPath);   //referencia de arquivo com caminho

                var upload = storageRef.put(file);

                trackUpload(upload).then(()=>{
                    storageRef.getDownloadURL().then((downloadURL)=>{

                        var data = {
                            imgUrl: downloadURL,
                            name: todoForm.name.value,
                            nameLowerCase: todoForm.name.value.toLowerCase()
                        }

                        completeTodoUpdate(data, todoImg.src);   // completa att da tarefa

                    });
                }).catch((error)=>{
                    showError('Falha ao atualizar tarefa: ' + error);
                });

            } else {
                alert('Adicione uma imagem!');
            }
        } else {
            // se não add imagem
            var data = {
                name: todoForm.name.value,
                nameLowerCase: todoForm.name.value.toLowerCase()
            }

            completeTodoUpdate(data);   // completa att da tarefa

        }   

    } else {
        alert('Adicione nome a tarefa!');
    }
}

// completa att da tarefa - função que atualiza no realtime database
function completeTodoUpdate(data, imgUrl){

    dbFirestore.doc(firebase.auth().currentUser.uid)
            .collection('tarefas').doc(updateTodoKey).update(data)
            .then(()=>{
                alert('Nome da Tarefa Atualizada para: ' + data.name);
                if(imgUrl){
                    removeFile(imgUrl); // remove imagem antiga
                }
            }).catch((error)=>{
                showError('Falha ao renomear tarefa: ', error);
            });

    //recurso do realtime database ---------------------------------------------------------------------
    // atualiza o nome da tarefa
    // dbRefUsers.child(firebase.auth().currentUser.uid).child(updateTodoKey).update(data).then(()=>{
    //     alert('Nome da Tarefa Atualizada para: ' + data.name);
    //     if(imgUrl){
    //         removeFile(imgUrl); // remove imagem antiga
    //     }
    // }).catch((error)=>{
    //     showError('Falha ao renomear tarefa: ', error);
    // });

    resetTodoForm();    // reseta para interface de add tarefa
}