/* reviews.js — customer reviews with a circular avatar per review */
mountNav('reviews');
loadSession();

const REVIEWS = [
  { name: 'Ananya Rao', route: 'Hyderabad → Bengaluru', rating: 5, avatar: 'https://i.pravatar.cc/100?img=47',
    text: 'Booking took less than two minutes and the live tracking meant I knew exactly when to head to the boarding point. The AC sleeper was spotless.' },
  { name: 'Karthik Subramaniam', route: 'Bengaluru → Chennai', rating: 5, avatar: 'https://i.pravatar.cc/100?img=12',
    text: 'Used the WEEKEND10 offer and saved a good bit on my ticket. Bus left right on time and the driver was careful on the ghat sections.' },
  { name: 'Priya Menon', route: 'Delhi → Kanpur', rating: 4, avatar: 'https://i.pravatar.cc/100?img=32',
    text: 'Smooth seat selection and the seat map made it easy to pick a window seat. Only wish there were more morning departures on this route.' },
  { name: 'Mohammed Irfan', route: 'Hyderabad → Bengaluru', rating: 5, avatar: 'https://i.pravatar.cc/100?img=51',
    text: 'Cancelled a trip last minute and the refund to my account was quick and hassle-free. Customer support answered within minutes.' },
  { name: 'Sneha Iyer', route: 'Bengaluru → Chennai', rating: 4, avatar: 'https://i.pravatar.cc/100?img=44',
    text: 'Comfortable overnight ride, charging point at every seat worked well, and the bus arrived close to the estimated time.' },
  { name: 'Arjun Verma', route: 'Delhi → Kanpur', rating: 5, avatar: 'https://i.pravatar.cc/100?img=14',
    text: 'My go-to app for weekend trips home now. Prices are clearly shown upfront with no surprise charges at checkout.' },
];

const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);

document.getElementById('reviewsGrid').innerHTML = REVIEWS.map(r => `
  <div class="review-card">
    <div class="review-top">
      <img class="review-avatar" src="${r.avatar}" alt="${r.name}" loading="lazy">
      <div>
        <div class="review-name">${r.name}</div>
        <div class="review-route">${r.route}</div>
      </div>
    </div>
    <div class="review-stars">${stars(r.rating)}</div>
    <p class="review-text">${r.text}</p>
  </div>`).join('');
