let display = document.querySelector('.shift'); 
let loginErr = document.querySelector('.loginError');
let signError = document.querySelector('.signupErr');

if(display !==''){
  setTimeout(() => 
  display.innerHTML ='',6000
)
}

if(loginErr !==''){
  setTimeout(()=>
  loginErr.remove(),5000
  )
}

if(signError !==''){
  setTimeout(()=>
  signError.remove(),5000
  )
}
    