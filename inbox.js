document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  //Submit email
  document.querySelector("#compose-form").addEventListener('submit', send_email);
  load_mailbox('sent');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#details').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#details').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  get_emails(mailbox);
}


function get_emails(mailbox){
fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(emails => {
  emails.forEach(email => {
    const element = document.createElement('div');
    element.innerHTML = `Sent by: ${email.sender}   Subject: ${email.subject}   Sent at: ${email.timestamp}`;
    element.style.border = "thin solid black";
    element.addEventListener('click', function () {
      read_email(email.id);
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#details').style.display = 'block';
      console.log(email.archived);
      if(email.archived === true){
        document.querySelector('#details').innerHTML = `<button id="reply">Reply</button><button id="unarchive">Unarchive</button><br>Sent by: ${email.sender} <br> Recipients: ${email.recipients} <br> Subject: ${email.subject} <br> Sent at: ${email.timestamp} <br> Body: ${email.body}`;
      document.querySelector('#unarchive').addEventListener('click', () => {
        console.log("unarchived");
        unarchive_email(email.id);
        console.log(email);
        load_mailbox('inbox');
      });
    }
      else {document.querySelector('#details').innerHTML = `<button id="reply">Reply</button><button id="archive">Archive</button><br>Sent by: ${email.sender} <br> Recipients: ${email.recipients} <br> Subject: ${email.subject} <br> Sent at: ${email.timestamp} <br> Body: ${email.body}`;
      document.querySelector('#archive').addEventListener('click', () => {
        console.log("archived");
        archive_email(email.id);
        load_mailbox('inbox');
      });
    }
    document.querySelector('#reply').addEventListener('click', () => {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      document.querySelector('#details').style.display = 'none';
      const replace = document.getElementById('compose-recipients');
      replace.defaultValue = email.sender;
      replace.disabled = true;
      if(email.subject.split(' ',1)[0] != "Re:") {
      document.getElementById('compose-subject').defaultValue = `Re: ${email.subject}`;}
      document.getElementById('compose-subject').disabled = true;
      document.getElementById('compose-body').defaultValue = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    })
    });
    document.querySelector('#emails-view').append(element);
  })
});
}

function getmail(email_id){
  fetch(`/emails/${email_id}`)
.then(response => response.json())
.then(email => {
    console.log(email);
});
}

function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body =document.querySelector('#compose-body').value;
  console.log(recipients,subject,body);
  fetch('/emails', {
    method: 'POST',
    mode: 'cors', // this cannot be 'no-cors'
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      console.log(result);
      console.log("before");
      console.log("sent");
  });
}

function archive_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
}

function unarchive_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
}

function read_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function notread_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: false
    })
  })
}
