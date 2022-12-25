import ImagesApiService from './js/images-service';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import LoadMoreBtn from './js/load-more';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  galleryContainer: document.querySelector('.gallery'),
  searchForm: document.querySelector('.search-form'),
  toUpBtn: document.querySelector('.go-up'),
};
const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  hidden: true,
});

const imagesApiService = new ImagesApiService();
const gallery = new SimpleLightbox('.gallery a');

refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', onLoadMore);
refs.toUpBtn.addEventListener('click', onUpScroll);
window.addEventListener('scroll', onScrollToUpBtn);

function onSearch(e) {
  e.preventDefault();

  loadMoreBtn.show();
  loadMoreBtn.disable();

  imagesApiService.query = e.currentTarget.elements.searchQuery.value.trim();
  imagesApiService.resetLoadedHits();
  imagesApiService.resetPage();
  

  if (!imagesApiService.query) {
    loadMoreBtn.hide();
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  imagesApiService.fetchArticles().then(({ hits, totalHits }) => {
  refs.galleryContainer.innerHTML = '';  
  Notify.success(`Hooray! We found ${totalHits} images.`);
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
    Notify.info("We're sorry, but you've reached the end of search results.");
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

function onScrollToUpBtn() {
  const offsetTrigger = 100;
  const pageOffset = window.pageYOffset;

  pageOffset > offsetTrigger
    ? refs.toUpBtn.classList.remove('is-hidden')
    : refs.toUpBtn.classList.add('is-hidden');
}

function onUpScroll() {
  window.scrollTo({
    top: 2,
    behavior: 'smooth',
  });
}

