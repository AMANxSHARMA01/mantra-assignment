import React, { useState, useEffect } from 'react';
import './App.css'

interface Book {
  id: number;
  title: string;
  chapter_ids: number[];
}

interface Page {
  id: number;
  page_index: number;
  image: {
    id: number;
    file: string;
    width: number;
    height: number;
  };
}

interface Chapter {
  id: number;
  title: string;
  pages: Page[];
}

const App = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);


  useEffect(() => {
    const fetchBooks = async () => {
      const response = await fetch('http://52.195.171.228:8080/books/');
      const data = await response.json();
      setBooks(data);
      if (data.length > 0) {
        setSelectedBookId(data[0].id); 
        fetchChapters(data[0].chapter_ids); 
      }
    };
    fetchBooks();
  }, []);


  const fetchChapters = async (chapterIds: number[]) => {
    const chapterPromises = chapterIds.map((id) =>
      fetch(`http://52.195.171.228:8080/chapters/${id}/`).then((res) => res.json())
    );
    const chapters = await Promise.all(chapterPromises);
    setChapters(chapters);
    if (chapters.length > 0) {
      setSelectedChapterId(chapters[0].id); 
      setPages(chapters[0].pages);
    }
  };


  useEffect(() => {
    if (selectedChapterId) {
      const fetchPages = async () => {
        const response = await fetch(`http://52.195.171.228:8080/chapters/${selectedChapterId}/`);
        const chapter = await response.json();
        setPages(chapter.pages);
        setCurrentPageIndex(0); 
      };
      fetchPages();
    }
  }, [selectedChapterId]);


  const handlePageClick = (direction: 'next' | 'previous') => {
    if (direction === 'next') {
      if (currentPageIndex < pages.length - 1) {
        setCurrentPageIndex(currentPageIndex + 1); 
      } else {
        const currentChapterIndex = chapters.findIndex((ch) => ch.id === selectedChapterId);
        if (currentChapterIndex < chapters.length - 1) {
          const nextChapter = chapters[currentChapterIndex + 1];
          setSelectedChapterId(nextChapter.id); 
        }
      }
    } else if (direction === 'previous') {
      if (currentPageIndex > 0) {
        setCurrentPageIndex(currentPageIndex - 1);
      } else {
        const currentChapterIndex = chapters.findIndex((ch) => ch.id === selectedChapterId);
        if (currentChapterIndex > 0) {
          const prevChapter = chapters[currentChapterIndex - 1];
          setSelectedChapterId(prevChapter.id); 
        }
      }
    }
  };

  return (
    <div>

      <div>
        {books.map((book) => (
          <button
            key={book.id}
            onClick={() => {
              setSelectedBookId(book.id);
              fetchChapters(book.chapter_ids); 
            }}
            style={{
              backgroundColor: book.id === selectedBookId ? 'lightblue' : 'white',
            }}
          >
            {book.title}
          </button>
        ))}
      </div>

      {chapters.length > 0 && (
        <div>
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => setSelectedChapterId(chapter.id)}
              style={{
                backgroundColor: chapter.id === selectedChapterId ? 'lightgreen' : 'white',
              }}
            >
             {chapter.title}
            </button>
          ))}
        </div>
      )}

   
      {pages.length > 0 && (
        <div>
          <img
            src={pages[currentPageIndex]?.image.file}
            alt={`Page ${currentPageIndex + 1}`}
            style={{ maxWidth: '100%' }}
            onClick={(e) => {
              if (e.clientX < window.innerWidth / 2) {
                handlePageClick('previous'); 
              } else {
                handlePageClick('next'); 
              }
            }}
          />
        </div>
      )}

    
      {pages.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          {currentPageIndex + 1} / {pages.length}
        </div>
      )}

      
    </div>
  );
};

export default App;
