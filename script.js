document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    let currentView = 'grid';
    let currentSort = 'name';
    let currentFilter = 'all';
    let selectedColor = null;
    let searchTerm = '';
    
    // DOM elements
    const colorGrid = document.getElementById('color-grid');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');
    const sortSelect = document.getElementById('sort-select');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('color-detail');
    const closeButton = document.querySelector('.close-button');
    
    // Initialize the color grid
    renderColors();
    
    // Event listeners
    searchInput.addEventListener('input', handleSearch);
    searchButton.addEventListener('click', () => handleSearch());
    gridViewBtn.addEventListener('click', () => setView('grid'));
    listViewBtn.addEventListener('click', () => setView('list'));
    sortSelect.addEventListener('change', handleSort);
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
    });
    closeButton.addEventListener('click', closeModal);
    
    // Copy buttons
    document.getElementById('copy-hex').addEventListener('click', () => copyToClipboard('hex'));
    document.getElementById('copy-rgb').addEventListener('click', () => copyToClipboard('rgb'));
    document.getElementById('copy-cmyk').addEventListener('click', () => copyToClipboard('cmyk'));
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Functions
    function renderColors() {
        // Clear the grid
        colorGrid.innerHTML = '';
        
        // Filter and sort colors
        let filteredColors = filterColors(colorData);
        let sortedColors = sortColors(filteredColors);
        
        // Check if there are any colors to display
        if (sortedColors.length === 0) {
            colorGrid.innerHTML = '<div class="no-results">No colors found matching your search.</div>';
            return;
        }
        
        // Render each color card
        sortedColors.forEach((color, index) => {
            const card = createColorCard(color, index);
            colorGrid.appendChild(card);
        });
    }
    
    function createColorCard(color, index) {
        const card = document.createElement('div');
        card.className = `color-card fadeInUp ${currentView === 'list' ? 'list-view' : ''}`;
        card.style.animationDelay = `${index * 0.05}s`;
        
        const preview = document.createElement('div');
        preview.className = 'color-preview';
        preview.style.backgroundColor = color.hex;
        
        const info = document.createElement('div');
        info.className = 'color-info';
        
        const name = document.createElement('h3');
        name.textContent = color.name;
        
        const hex = document.createElement('div');
        hex.textContent = color.hex;
        hex.style.fontWeight = '500';
        
        const values = document.createElement('div');
        values.className = 'color-values';
        
        const rgbValue = document.createElement('span');
        rgbValue.className = 'value-item';
        rgbValue.textContent = `RGB: ${color.rgb_array.join(', ')}`;
        
        const usageCount = document.createElement('span');
        usageCount.className = 'value-item';
        usageCount.textContent = `Used in ${color.use_count} combinations`;
        
        values.appendChild(rgbValue);
        values.appendChild(usageCount);
        
        info.appendChild(name);
        info.appendChild(hex);
        info.appendChild(values);
        
        card.appendChild(preview);
        card.appendChild(info);
        
        // Add click event to open modal
        card.addEventListener('click', () => openColorDetail(color));
        
        return card;
    }
    
    function filterColors(colors) {
        // Filter by search term
        let filtered = colors.filter(color => {
            if (searchTerm === '') return true;
            
            const searchLower = searchTerm.toLowerCase();
            return (
                color.name.toLowerCase().includes(searchLower) ||
                color.hex.toLowerCase().includes(searchLower) ||
                color.rgb.toLowerCase().includes(searchLower) ||
                color.cmyk.toLowerCase().includes(searchLower)
            );
        });
        
        // Filter by category
        if (currentFilter !== 'all') {
            filtered = filtered.filter(color => {
                const name = color.name.toLowerCase();
                const hex = color.hex.toLowerCase();
                
                switch (currentFilter) {
                    case 'red':
                        return name.includes('red') || 
                               name.includes('carmine') || 
                               name.includes('sienna') ||
                               (color.rgb_array[0] > 180 && color.rgb_array[1] < 100);
                    case 'yellow':
                        return name.includes('yellow') || 
                               name.includes('lemon') || 
                               name.includes('cream') ||
                               (color.rgb_array[0] > 200 && color.rgb_array[1] > 200 && color.rgb_array[2] < 150);
                    case 'pink':
                        return name.includes('pink') || 
                               name.includes('rose') ||
                               (color.rgb_array[0] > 200 && color.rgb_array[2] > 150 && color.rgb_array[1] < color.rgb_array[0]);
                    default:
                        return true;
                }
            });
        }
        
        return filtered;
    }
    
    function sortColors(colors) {
        return [...colors].sort((a, b) => {
            switch (currentSort) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'use_count':
                    return b.use_count - a.use_count;
                case 'index':
                    return a.index - b.index;
                default:
                    return 0;
            }
        });
    }
    
    function handleSearch() {
        searchTerm = searchInput.value.trim();
        renderColors();
        
        // Add animation to search results
        const cards = document.querySelectorAll('.color-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
            card.classList.remove('fadeInUp');
            void card.offsetWidth; // Trigger reflow
            card.classList.add('fadeInUp');
        });
    }
    
    function setView(view) {
        currentView = view;
        colorGrid.className = `${view}-view`;
        
        // Update active button
        gridViewBtn.classList.toggle('active', view === 'grid');
        listViewBtn.classList.toggle('active', view === 'list');
        
        // Update card classes
        const cards = document.querySelectorAll('.color-card');
        cards.forEach(card => {
            card.classList.toggle('list-view', view === 'list');
        });
    }
    
    function handleSort() {
        currentSort = sortSelect.value;
        renderColors();
    }
    
    function handleFilter(filter) {
        currentFilter = filter;
        
        // Update active button
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        renderColors();
    }
    
    function openColorDetail(color) {
        selectedColor = color;
        
        // Set color details
        document.getElementById('detail-name').textContent = color.name;
        document.getElementById('detail-hex').textContent = color.hex;
        document.getElementById('detail-rgb').textContent = color.rgb;
        document.getElementById('detail-cmyk').textContent = color.cmyk;
        
        // Set color swatch
        const swatch = document.querySelector('.color-swatch');
        swatch.style.backgroundColor = color.hex;
        
        // Set combinations
        const combinationsContainer = document.getElementById('combinations-container');
        combinationsContainer.innerHTML = '';
        
        if (color.combinations && color.combinations.length > 0) {
            // Find colors that are in combinations with this color
            const combinationColors = findCombinationColors(color);
            
            combinationColors.forEach(comboColor => {
                const chip = document.createElement('div');
                chip.className = 'combination-chip';
                
                const colorDot = document.createElement('span');
                colorDot.className = 'combination-color';
                colorDot.style.backgroundColor = comboColor.hex;
                
                const colorName = document.createElement('span');
                colorName.textContent = comboColor.name;
                
                chip.appendChild(colorDot);
                chip.appendChild(colorName);
                
                // Add click event to open this color
                chip.addEventListener('click', () => {
                    closeModal();
                    setTimeout(() => openColorDetail(comboColor), 300);
                });
                
                combinationsContainer.appendChild(chip);
            });
        } else {
            combinationsContainer.innerHTML = '<p>No combinations found for this color.</p>';
        }
        
        // Show modal with animation
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    function findCombinationColors(color) {
        const result = [];
        
        // Get all combination numbers for this color
        const combinations = color.combinations || [];
        
        // Find colors that share these combinations
        combinations.forEach(comboNumber => {
            colorData.forEach(otherColor => {
                if (otherColor.index !== color.index && 
                    otherColor.combinations && 
                    otherColor.combinations.includes(comboNumber) &&
                    !result.some(c => c.index === otherColor.index)) {
                    result.push(otherColor);
                }
            });
        });
        
        // Limit to 12 combinations to avoid overcrowding
        return result.slice(0, 12);
    }
    
    function copyToClipboard(type) {
        if (!selectedColor) return;
        
        let textToCopy = '';
        
        switch (type) {
            case 'hex':
                textToCopy = selectedColor.hex;
                break;
            case 'rgb':
                textToCopy = `rgb(${selectedColor.rgb_array.join(', ')})`;
                break;
            case 'cmyk':
                textToCopy = selectedColor.cmyk;
                break;
        }
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => showCopyNotification(`Copied ${type.toUpperCase()}: ${textToCopy}`))
            .catch(err => console.error('Could not copy text: ', err));
    }
    
    function showCopyNotification(message) {
        // Create notification if it doesn't exist
        let notification = document.querySelector('.copy-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'copy-notification';
            document.body.appendChild(notification);
        }
        
        // Set message and show
        notification.textContent = message;
        notification.classList.add('show');
        
        // Hide after 2 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
    
    // Add scroll to top button functionality
    const scrollTopBtn = document.createElement('div');
    scrollTopBtn.className = 'scroll-top';
    scrollTopBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
    document.body.appendChild(scrollTopBtn);
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    // Add theme toggle functionality
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    document.body.appendChild(themeToggle);
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        
        // Update theme icon
        if (document.body.classList.contains('dark-theme')) {
            themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
        } else {
            themeToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
        }
    });
    
    // Add animation on scroll
    const animateOnScroll = () => {
        const cards = document.querySelectorAll('.color-card');
        
        cards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight - 100) {
                card.classList.add('fadeInUp');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    
    // Initial animation
    setTimeout(animateOnScroll, 100);
});
