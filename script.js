// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
    
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarToggler && !navbarToggler.classList.contains('collapsed')) {
                    navbarToggler.click();
                }
            }
        });
    });

    // Booking Modal
    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    const bookNowButtons = document.querySelectorAll('.book-now, .vehicle-card .btn');
    
    bookNowButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingType = this.closest('.vehicle-card') ? 'vehicle' : 'tour';
            const itemName = this.getAttribute('data-tour') || this.getAttribute('data-vehicle');
            
            document.getElementById('bookingType').value = bookingType;
            document.getElementById('itemName').value = itemName;
            document.getElementById('bookingModalLabel').textContent = `Book ${itemName}`;
            
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('date').min = today;
            
            bookingModal.show();
        });
    });

    // Handle form submission
    const bookingForm = document.getElementById('bookingForm');
    const confirmBookingBtn = document.getElementById('confirmBooking');
    
    confirmBookingBtn.addEventListener('click', function() {
        if (bookingForm.checkValidity()) {
            // In a real app, you would send this data to your server
            const formData = {
                type: document.getElementById('bookingType').value,
                item: document.getElementById('itemName').value,
                name: document.getElementById('fullName').value,
                email: document.getElementById('bookingEmail').value,
                phone: document.getElementById('phone').value,
                date: document.getElementById('date').value,
                guests: document.getElementById('guests').value,
                requests: document.getElementById('specialRequests').value,
                status: 'Confirmed',
                bookingId: 'BK' + Math.floor(100000 + Math.random() * 900000)
            };
            
            // Save to localStorage (in a real app, this would be an API call)
            saveBooking(formData);
            
            // Show success message
            alert(`Booking confirmed! Your booking ID is: ${formData.bookingId}`);
            
            // Reset form and close modal
            bookingForm.reset();
            bookingModal.hide();
            
            // Update bookings table
            loadBookings();
        } else {
            // Trigger HTML5 validation
            bookingForm.reportValidity();
        }
    });

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real app, you would send this data to your server
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }

    // Payment Form Submission
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const bookingId = document.getElementById('bookingId').value;
            const amount = document.getElementById('amount').value;
            
            // In a real app, you would process the payment here
            alert(`Payment of $${amount} for booking ${bookingId} has been processed successfully!`);
            
            // Reset form
            paymentForm.reset();
        });
    }

    // Load bookings when the page loads
    loadBookings();
});

// Save booking to localStorage
function saveBooking(bookingData) {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// Load and display bookings
function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const upcomingBookingsTable = document.getElementById('upcomingBookings');
    const pastBookingsTable = document.getElementById('pastBookings');
    
    if (!upcomingBookingsTable || !pastBookingsTable) return;
    
    // Clear existing rows
    upcomingBookingsTable.innerHTML = '';
    pastBookingsTable.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort bookings by date (newest first)
    bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (bookings.length === 0) {
        upcomingBookingsTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No upcoming bookings found.</td>
            </tr>`;
            
        pastBookingsTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No past bookings found.</td>
            </tr>`;
        return;
    }
    
    let upcomingBookingsHtml = '';
    let pastBookingsHtml = '';
    
    bookings.forEach(booking => {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        
        const row = `
            <tr>
                <td>${booking.bookingId}</td>
                <td>${booking.item} (${booking.type.charAt(0).toUpperCase() + booking.type.slice(1)})</td>
                <td>${new Date(booking.date).toLocaleDateString()}</td>
                <td><span class="badge bg-success">${booking.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-booking" data-booking-id="${booking.bookingId}">
                        View Details
                    </button>
                </td>
            </tr>`;
        
        if (bookingDate >= today) {
            upcomingBookingsHtml += row;
        } else {
            pastBookingsHtml += row;
        }
    });
    
    upcomingBookingsTable.innerHTML = upcomingBookingsHtml || `
        <tr>
            <td colspan="5" class="text-center">No upcoming bookings found.</td>
        </tr>`;
        
    pastBookingsTable.innerHTML = pastBookingsHtml || `
        <tr>
            <td colspan="5" class="text-center">No past bookings found.</td>
        </tr>`;
    
    // Add event listeners to view booking buttons
    document.querySelectorAll('.view-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            viewBookingDetails(bookingId);
        });
    });
}

// View booking details
function viewBookingDetails(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (!booking) {
        alert('Booking not found!');
        return;
    }
    
    // In a real app, you might show this in a modal or dedicated page
    const details = `
        <h4>Booking Details</h4>
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
        <p><strong>Type:</strong> ${booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}</p>
        <p><strong>Item:</strong> ${booking.item}</p>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
        <p><strong>Number of Guests:</strong> ${booking.guests}</p>
        <p><strong>Special Requests:</strong> ${booking.requests || 'None'}</p>
        <p><strong>Status:</strong> <span class="badge bg-success">${booking.status}</span></p>
    `;
    
    // In a real app, you might show this in a modal
    alert(details);
}

// Add animation on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.card, section h2');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
            element.classList.add('animate-fadeInUp');
        }
    });
}

// Run animation on load and scroll
window.addEventListener('load', animateOnScroll);
window.addEventListener('scroll', animateOnScroll);

// Initialize date picker for booking form
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        // Set minimum date to today
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        dateInput.min = `${yyyy}-${mm}-${dd}`;
    }
});
