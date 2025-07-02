db = db.getSiblingDB('user-db');
db.createUser({
  user: 'user',
  pwd: 'userpass',
  roles: [{ role: 'readWrite', db: 'user-db' }]
});

db = db.getSiblingDB('book-db');
db.createUser({
  user: 'book',
  pwd: 'bookpass',
  roles: [{ role: 'readWrite', db: 'book-db' }]
});

db = db.getSiblingDB('loan-db');
db.createUser({
  user: 'loan',
  pwd: 'loanpass',
  roles: [{ role: 'readWrite', db: 'loan-db' }]
});
