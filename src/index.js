import ImagesApiService from './js/images-service';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import LoadMoreBtn from './js/load-more';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  galleryContainer: document.querySelector('.gallery'),
  searchForm: document.querySelector('.search-form'),
};
const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  hidden: true,
});

const imagesApiService = new ImagesApiService();
const gallery = new SimpleLightbox('.gallery a');

refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', onLoadMore);

function onSearch(e) {
  e.preventDefault();

  loadMoreBtn.show();
  loadMoreBtn.disable();

  imagesApiService.query = e.currentTarget.elements.searchQuery.value.trim();
  imagesApiService.resetLoadedHits();
  imagesApiService.resetPage();
  

  if (!imagesApiService.query) {
    loadMoreBtn.hide();
    return erorrQuery();
  }
  imagesApiService.fetchArticles().then(({ hits, totalHits }) => {
  clearGelleryContainer();  
  accessQuery(totalHits);
  appendArticlesMarkup({ hits, totalHits });
  });
}

function onLoadMore() {
  loadMoreBtn.disable();
  imagesApiService.fetchArticles().then(appendArticlesMarkup);
}

function appendArticlesMarkup({ hits, totalHits }) {
  loadMoreBtn.enable();
  createGalleryMarkup(hits);
  imagesApiService.incrementLoadedHits(hits);
  gallery.refresh();

  if (totalHits <= imagesApiService.loadedHits) {
    loadMoreBtn.hide();
    endOfSearch();
  }
}

function createGalleryMarkup(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
    <div class="photo-card">
      <a href="${webformatURL}">
        <img
          class="photo-card__img"
          src="${largeImageURL}" 
          alt="${tags}" 
          loading="lazy" 
          width="320"
          height="212"
        />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          <span>${likes}</span>
        </p>
        <p class="info-item">
          <b>Views</b>
          <span>${views}</span>
        </p>
        <p class="info-item">
          <b>Comments</b>
          <span>${comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads</b>
          <span>${downloads}</span>
        </p>
      </div>
    </div>
    `;
      }
    )
    .join('');

  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
}

function accessQuery(totalHits) {
  Notify.success(`Hooray! We found ${totalHits} images.`);
}

function endOfSearch() {
  Notify.info("We're sorry, but you've reached the end of search results.");
}

function erorrQuery() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function clearGelleryContainer() {
  refs.galleryContainer.innerHTML = '';
}
