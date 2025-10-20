import { Button } from 'react-aria-components';

function Categories({ onSelectCategory, isLoading = true, selectedCategoryName = '', ref}) {
    return (
        <div className="categories-screen">
            <h1 ref={ref} tabIndex={-1}>Choose a Category</h1>
            <div className="categories-content">
            {!isLoading ? (
            <div className={`category-buttons ${isLoading ? 'fade-out' : ''}`}>
                <Button onClick={() => onSelectCategory('years')} className="primary-button">
                Release Years
                </Button>
                <Button onClick={() => onSelectCategory('directors')} className="primary-button">
                Directors
                </Button>
                <Button onClick={() => onSelectCategory('actors')} className="primary-button">
                Actors
                </Button>
            </div>
            ) : (
                <div className="loading-message" data-testid="loading-message">
                Creating {selectedCategoryName} questions...
                </div>
            )}
            </div>
        </div>
    );
}

export default Categories;
