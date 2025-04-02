import { initCharts, updateCharts, updateChartDisplay, destroyCharts } from './charts.js';

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
    }

    const fileInput = document.getElementById('csvFile');
    const fileInputLabel = document.querySelector('.file-input-label');
    const fileInfoSection = document.getElementById('fileInfo');
    const appContent = document.getElementById('appContent');
    const emptyState = document.getElementById('emptyState');
    const clearFileBtn = document.getElementById('clearFile');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const emptyTableMessage = document.getElementById('emptyTableMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const chartToggles = document.querySelectorAll('.chart-toggle');

    let mediaData = [];
    let filteredData = [];

    fileInputLabel.addEventListener('dragover', function(e) {
        e.preventDefault();
        fileInputLabel.classList.add('drag-over');
    });
    fileInputLabel.addEventListener('dragleave', function(e) {
        e.preventDefault();
        fileInputLabel.classList.remove('drag-over');
    });
    fileInputLabel.addEventListener('drop', function(e) {
        e.preventDefault();
        fileInputLabel.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });
    clearFileBtn.addEventListener('click', resetUI);

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId + 'Tab').classList.add('active');
            if (tabId === 'statistics') {
                updateCharts();
            }
        });
    });

    document.getElementById('searchTitle').addEventListener('input', debounce(filterMedia, 300));
    document.getElementById('filterYear').addEventListener('change', filterMedia);
    document.getElementById('filterGenre').addEventListener('change', filterMedia);
    document.getElementById('filterLocation').addEventListener('change', filterMedia);
    document.getElementById('filterQuality').addEventListener('change', filterMedia);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    chartToggles.forEach(button => {
        button.addEventListener('click', function() {
            const chartName = this.getAttribute('data-chart');
            const displayType = this.getAttribute('data-type');
            document.querySelectorAll(`.chart-toggle[data-chart="${chartName}"]`).forEach(btn => {
                btn.classList.remove('active', 'bg-indigo-600', 'text-white');
                btn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
            });
            this.classList.add('active', 'bg-indigo-600', 'text-white');
            this.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
            if (typeof updateChartDisplay === 'function') {
                updateChartDisplay(chartName, displayType);
            }
        });
    });

    function handleFileUpload(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('Please upload a valid CSV file.');
            return;
        }
        loadingSpinner.classList.remove('hidden');
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                parseCSV(content);
                fileInfoSection.classList.remove('hidden');
                appContent.classList.remove('hidden');
                emptyState.classList.add('hidden');
            } catch (error) {
                console.error('Erreur lors du parsing du CSV : ', error);
                alert('The CSV file cannot be processed.');
            }
        };
        reader.readAsText(file);
    }

    function parseCSV(content) {
        mediaData = [];
        const lines = content.split('\n').filter(line => line.trim() !== '');
        lines.forEach(line => {
            const parts = line.split(';').map(p => p.trim());
            if (parts.length !== 6) return;
            const mediaItem = {
                year: parseInt(parts[0], 10),
                title: parts[1],
                genres: parts[2].split(',').map(g => g.trim()),
                location: parts[3],
                size: parseFloat(parts[4]),
                quality: parts[5]
            };
            mediaData.push(mediaItem);
        });
        window.mediaData = mediaData;

        document.getElementById('itemCount').textContent = mediaData.length;
        const totalSizeGB = mediaData.reduce((sum, item) => sum + item.size, 0);
        document.getElementById('totalSize').textContent = `${totalSizeGB.toFixed(1)} GB`;
        updateFilterDropdowns();
        filteredData = [...mediaData];
        updateMediaTable();
        updateResultCount();
        if (typeof initCharts === 'function') {
            initCharts();
        }
    }

    function loadDefaultCSV() {
        fetch('/movies.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error loading the CSV file');
                }
                return response.text();
            })
            .then(content => {
                parseCSV(content);
                fileInfoSection.classList.remove('hidden');
                appContent.classList.remove('hidden');
                emptyState.classList.add('hidden');
                document.getElementById('fileName').textContent = 'default.csv';
                document.getElementById('fileSize').textContent = formatFileSize(new Blob([content]).size);
            })
            .catch(error => {
                console.error(error);
                alert('The default CSV file could not be loaded.');
            });
    }

    loadDefaultCSV();

    function updateFilterDropdowns() {
        const yearSelect = document.getElementById('filterYear');
        yearSelect.innerHTML = '<option value="">All Years</option>';
        const years = [...new Set(mediaData.map(item => item.year))].sort((a, b) => b - a);
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
        const genreSelect = document.getElementById('filterGenre');
        genreSelect.innerHTML = '<option value="">All Genres</option>';
        const allGenres = mediaData.flatMap(item => item.genres);
        const uniqueGenres = [...new Set(allGenres)].sort((a, b) => a.localeCompare(b));
        uniqueGenres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });
        const locationSelect = document.getElementById('filterLocation');
        locationSelect.innerHTML = '<option value="">All Locations</option>';
        const locations = [...new Set(mediaData.map(item => item.location))].sort((a, b) => a.localeCompare(b));
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationSelect.appendChild(option);
        });
    }

    function filterMedia() {
        loadingSpinner.classList.remove('hidden');
        setTimeout(() => {
            const titleSearch = document.getElementById('searchTitle').value.toLowerCase();
            const yearFilter = document.getElementById('filterYear').value;
            const genreFilter = document.getElementById('filterGenre').value;
            const locationFilter = document.getElementById('filterLocation').value;
            const qualityFilter = document.getElementById('filterQuality').value;
            filteredData = mediaData.filter(item => {
                if (titleSearch && !item.title.toLowerCase().includes(titleSearch)) return false;
                if (yearFilter && item.year !== parseInt(yearFilter, 10)) return false;
                if (genreFilter && !item.genres.includes(genreFilter)) return false;
                if (locationFilter && item.location !== locationFilter) return false;
                if (qualityFilter && item.quality !== qualityFilter) return false;
                return true;
            });
            updateMediaTable();
            updateResultCount();
            loadingSpinner.classList.add('hidden');
        }, 10);
    }

    function resetFilters() {
        document.getElementById('searchTitle').value = '';
        document.getElementById('filterYear').value = '';
        document.getElementById('filterGenre').value = '';
        document.getElementById('filterLocation').value = '';
        document.getElementById('filterQuality').value = '';
        filteredData = [...mediaData];
        updateMediaTable();
        updateResultCount();
    }

    function updateMediaTable() {
        const tableBody = document.getElementById('mediaTableBody');
        tableBody.innerHTML = '';
        if (filteredData.length === 0) {
            emptyTableMessage.classList.remove('hidden');
            return;
        }
        emptyTableMessage.classList.add('hidden');
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'highlight-row transition-colors duration-100';
            const yearCell = document.createElement('td');
            yearCell.className = 'px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200';
            yearCell.textContent = item.year;
            row.appendChild(yearCell);
            const titleCell = document.createElement('td');
            titleCell.className = 'px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200';
            titleCell.textContent = item.title;
            row.appendChild(titleCell);
            const genresCell = document.createElement('td');
            genresCell.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200';
            item.genres.forEach(genre => {
                const chip = document.createElement('span');
                chip.className = 'chip genre-chip';
                chip.textContent = genre;
                genresCell.appendChild(chip);
            });
            row.appendChild(genresCell);
            const locationCell = document.createElement('td');
            locationCell.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200';
            locationCell.textContent = item.location;
            row.appendChild(locationCell);
            const sizeCell = document.createElement('td');
            sizeCell.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200';
            sizeCell.textContent = `${item.size.toFixed(1)} GB`;
            row.appendChild(sizeCell);
            const qualityCell = document.createElement('td');
            qualityCell.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200';
            const qualityChip = document.createElement('span');
            qualityChip.className = `chip quality-chip ${item.quality}`;
            qualityChip.textContent = item.quality;
            qualityCell.appendChild(qualityChip);
            row.appendChild(qualityCell);
            tableBody.appendChild(row);
        });
    }

    function updateResultCount() {
        const resultCount = document.getElementById('resultCount');
        if (filteredData.length === mediaData.length) {
            resultCount.textContent = `Showing all ${mediaData.length.toLocaleString()} items`;
        } else {
            resultCount.textContent = `${filteredData.length.toLocaleString()} of ${mediaData.length.toLocaleString()} items`;
        }
        if (filteredData.length === 0) {
            resultCount.classList.add('text-red-500');
            resultCount.classList.remove('text-gray-500');
        } else {
            resultCount.classList.add('text-gray-500');
            resultCount.classList.remove('text-red-500');
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function resetUI() {
        fileInput.value = '';
        fileInfoSection.classList.add('hidden');
        appContent.classList.add('hidden');
        emptyState.classList.remove('hidden');
        mediaData = [];
        filteredData = [];
        resetFilters();
        emptyTableMessage.classList.add('hidden');
        if (typeof destroyCharts === 'function') {
            destroyCharts();
        }
    }

    function debounce(func, delay) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    document.getElementById('hideButton').addEventListener('click', function() {
        var csvUploadDiv = document.getElementById('csvUploadDiv');
        if (csvUploadDiv.style.display === 'none') {
            csvUploadDiv.style.display = 'block';
            this.querySelector('span').textContent = 'Hide';
        } else {
            csvUploadDiv.style.display = 'none';
            this.querySelector('span').textContent = 'Show';
        }
    });
});
