"use client";

import { useState, useEffect } from 'react';
import { FaSearch, FaBook, FaHeart } from 'react-icons/fa';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const books = [
  {
    id: '1',
    title: 'מועדון 5 בבוקר',
    author: 'רובין שארמה',
    description: 'ספר על חשיבות ההתעוררות מוקדם והשגת שליטה על היום שלך',
    category: 'הרגלים',
    rating: 4.8,
    pages: 320,
    image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1574865995i/40265871.jpg'
  },
  {
    id: '2',
    title: '12 כללים לחיים',
    author: 'ג\'ורדן ב. פיטרסון',
    description: 'מדריך מעשי להתמודדות עם אתגרי החיים והתפתחות אישית',
    category: 'פילוסופיה',
    rating: 4.7,
    pages: 448,
    image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532384746i/30257963.jpg'
  },
  {
    id: '3',
    title: 'גריט',
    author: 'אנגלה דאקוורת',
    description: 'כוחה של התשוקה וההתמדה - מפתח להצלחה',
    category: 'הצלחה',
    rating: 4.6,
    pages: 368,
    image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1441268322i/27213329.jpg'
  },
  {
    id: '4',
    title: 'האטומיסטים',
    author: 'ג\'יימס קליר',
    description: 'מדע ההרגלים הקטנים שיוצרים תוצאות מדהימות',
    category: 'הרגלים',
    rating: 4.9,
    pages: 320,
    image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1557676694i/40121378.jpg'
  },
  {
    id: '5',
    title: 'חשיבה מהירה איטית',
    author: 'דניאל כהנמן',
    description: 'ספר על מערכת החשיבה שלנו והטיות קוגניטיביות',
    category: 'פסיכולוגיה',
    rating: 4.5,
    pages: 512,
    image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1337618712i/11468377.jpg'
  },
  {
    id: '6',
    title: 'האדם מחפש משמעות',
    author: 'ויקטור פרנקל',
    description: 'ספר על כוחה של המשמעות בחיינו והתמודדות עם קשיים',
    category: 'פילוסופיה',
    rating: 4.9,
    pages: 224,
    image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535419399i/4069.jpg'
  }
];

const categories = ['הכל', 'מועדפים', 'הרגלים', 'פילוסופיה', 'הצלחה', 'פסיכולוגיה'];

export default function BooksSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();

  // Load favorites from Firebase and listen for real-time updates
  useEffect(() => {
    let unsubscribe: () => void;

    const setupFavorites = async () => {
      if (!user) {
        const savedFavorites = localStorage.getItem('bookFavorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Subscribe to real-time updates
        unsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setFavorites(userData.favoriteBooks || []);
            // Update localStorage
            localStorage.setItem('bookFavorites', JSON.stringify(userData.favoriteBooks || []));
          }
        });

        // Initial load
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const savedFavorites = localStorage.getItem('bookFavorites');
          if (savedFavorites) {
            const favoritesArray = JSON.parse(savedFavorites);
            await setDoc(userDocRef, { favoriteBooks: favoritesArray }, { merge: true });
          }
        }
      } catch (error) {
        console.error('Error setting up favorites:', error);
      }
    };

    setupFavorites();

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const toggleFavorite = async (bookId: string) => {
    if (!user) {
      // אם המשתמש לא מחובר, שומרים רק ב-localStorage
      const newFavorites = favorites.includes(bookId)
        ? favorites.filter(id => id !== bookId)
        : [...favorites, bookId];
      
      setFavorites(newFavorites);
      localStorage.setItem('bookFavorites', JSON.stringify(newFavorites));
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const newFavorites = favorites.includes(bookId)
        ? favorites.filter(id => id !== bookId)
        : [...favorites, bookId];

      await setDoc(userDocRef, { favoriteBooks: newFavorites }, { merge: true });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'הכל' ? true :
      selectedCategory === 'מועדפים' ? favorites.includes(book.id) :
      book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">ספרים מומלצים</h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="חפש ספרים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pr-10 pl-4 text-right bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-black shadow-sm"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-[#ff8714] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 bg-[#ff8714]/10 flex items-center justify-center">
              <FaBook className="w-12 h-12 text-[#ff8714] opacity-75" />
              <button
                onClick={() => toggleFavorite(book.id)}
                className="absolute top-4 left-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              >
                <FaHeart 
                  className={`w-5 h-5 ${
                    favorites.includes(book.id) 
                      ? 'text-red-500' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>
            </div>
            <div className="p-4">
              <div className="inline-block px-2 py-1 bg-[#ff8714]/10 text-[#ff8714] text-xs font-medium rounded-full mb-2">
                {book.category}
              </div>
              <h3 className="text-lg font-bold mb-1 text-gray-900">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">מאת: {book.author}</p>
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">{book.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{book.pages} עמודים</span>
                <span>⭐ {book.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg">
            {selectedCategory === 'מועדפים' 
              ? user 
                ? 'עדיין לא סימנת ספרים כמועדפים'
                : 'התחבר כדי לשמור ספרים מועדפים'
              : 'לא נמצאו ספרים מתאימים לחיפוש שלך'
            }
          </div>
        </div>
      )}
    </div>
  );
} 