import axios from 'axios';
import { proxy, urlQ } from '../config';

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResults() {
    try {
      const res = await axios(`${proxy}${urlQ}${this.query}`);
      this.result = res.data.recipes;
      //console.log(this.result);
    } catch (error) {
      alert(error)
    }
  }
}


