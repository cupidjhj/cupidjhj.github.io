import React, { useState, useEffect } from 'react';
import { firestore } from './firebase';
import './App.css';

export function SearchPage () {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('');
  const [orderByField, setOrderByField] = useState('createdAt');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = firestore.collection('messages');

      if (searchTerm && searchField) {
        query = query.where(searchField, '>=', searchTerm)
                    .where(searchField, '<=', searchTerm + '\uf8ff');
      }

      if (orderByField) {
        query = query.orderBy(orderByField);
      }

      const snapshot = await query.get();
      const fetchedData = [];
      snapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() });
      });

      setData(fetchedData);
    } catch (error) {
      console.error('Error fetching data: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchFieldChange = (event) => {
    setSearchField(event.target.value);
  };

  const handleOrderByFieldChange = (event) => {
    setOrderByField(event.target.value);
  };

  const handleSearch = () => {
    fetchData();
  };

  return (
    <div>
      <select value={searchField} onChange={handleSearchFieldChange}>
        <option value="">Select Field</option>
        <option value="text">text</option>
        <option value="createdAt">time</option>
      </select>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchTermChange}
        placeholder="Search..."
      />
      <select value={orderByField} onChange={handleOrderByFieldChange}>
        <option value="createdAt">Time</option>
      </select>
      <button onClick={handleSearch}>Search</button>
      {loading ? (      
      <img height="40" src={'/icons/loading.gif'}  alt="loading"/>
      ) :
      <ul className='items'>
        {data.map((item) => (
          <li key={item.id} className='item'>
            {JSON.stringify(item.text)}
          </li>
        ))}
      </ul>}
    </div>
  );
};
export default SearchPage;