'use strict';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

const searchBox = document.querySelector('.search-box');
const searchInput = document.querySelector('.search-input');
const upBtn = document.querySelector('.up-btn');
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const clear = elems => [...elems.children].forEach(div => div.remove());
const loadBtn = document.querySelector('.load-more');
const lightbox = () => new SimpleLightbox('.gallery a', {});
let perPage = 40;
let page = 0;
let name = searchInput;

loadBtn.style.display = 'none';
upBtn.style.display = 'none';

async function fetchImages(name, page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=41607639-9993ac366cbcde95b3b457669&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

async function eventHandler(ev) {
  ev.preventDefault();
  clear(gallery);
  loadBtn.style.display = 'none';
  page = 1;
  name = searchInput.value;
  console.log(name);
  fetchImages(name, page)
    .then(name => {
      console.log(`Number of arrays: ${name.hits.length}`);
      console.log(`Total hits: ${name.totalHits}`);
      let totalPages = Math.ceil(name.totalHits / perPage);
      console.log(`Total pages: ${totalPages}`);

      if (name.hits.length > 0) {
        Notiflix.Notify.success(`Hooray! We found ${name.totalHits} images.`);
        renderGallery(name);
        console.log(`Current page: ${page}`);
        lightbox();
        upBtn.style.display = 'block';
        upBtn.addEventListener('click', () => {
          searchBox.scrollIntoView({
            behavior: 'smooth',
          });
        });

        if (page < totalPages) {
          loadBtn.style.display = 'block';
        } else {
          loadBtn.style.display = 'none';
          console.log('There are no more images');
          Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }
      } else {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
        );
        clear(gallery); 
      }
    })
    .catch(error => console.log(error));
}

searchForm.addEventListener('submit', eventHandler);

function renderGallery(name) {
  const markup = name.hits
    .map(hit => {
      return `<div class="photo-card">
      <a class="gallery__item" href="${hit.largeImageURL}"> <img class="gallery__image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          <p><b>Likes</b> <br>${hit.likes}</br></p>
        </p>
        <p class="info-item">
          <p><b>Views</b> <br>${hit.views}</br></p>
        </p>
        <p class="info-item">
          <p><b>Comments</b> <br>${hit.comments}</br></p>
        </p>
        <p class="info-item">
          <p><b>Downloads</b> <br>${hit.downloads}</br></p>
        </p>
      </div>
    </div>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

loadBtn.addEventListener(
  'click',
  () => {
    name = searchInput.value;
    console.log('load more images');
    page += 1;
    fetchImages(name, page).then(name => {
      let totalPages = Math.ceil(name.totalHits / perPage);
      renderGallery(name);
      //smooth scroll
      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    
      lightbox().refresh();
      console.log(`Current page: ${page}`);

      if (page >= totalPages) {
        loadBtn.style.display = 'none';
        console.log('There are no more images');
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      }
    });
  },
  true,
);

