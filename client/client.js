import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './main.html';

// counter starts at 0
Session.setDefault('counter', 0);

Template.hello.helpers({
  counter() {
    return Session.get('counter');
  },
});

Template.hello.events({
  'click button'() {
    // increment the counter when button is clicked
    Session.set('counter', Session.get('counter') + 1);
  },
});
