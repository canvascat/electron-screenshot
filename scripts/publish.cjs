import { publish } from 'gh-pages';

publish('dist', { message: 'update pages' }, (err) => {
  console.log(err ? err.message : 'publish success!');
});
