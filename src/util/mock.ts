import { random } from 'lodash';

export const createImageURL = (input?: string) =>
  input || `/images/${random(8)}.jpg`;
