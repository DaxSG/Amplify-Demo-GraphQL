import Container from "react-bootstrap/esm/Container";
import './SiteFooter.css'; // Assuming you create a separate CSS file for footer styles

function SiteFooter() {
    return (
        <footer className="site-footer py-5">
            <Container className="px-4">
                <div className="footer-content">
                    <div className="about-section">
                        <h5>About NewWave</h5>
                        <p>Leading the way in innovative digital solutions. Dedicated to providing state-of-the-art services for our clients.</p>
                    </div>
                    <div className="contact-section">
                        <h5>Contact Us</h5>
                        <p>Email: contact@newwave.com</p>
                        <p>Phone: (123) 456-7890</p>
                    </div>
                    <div className="social-media-section">
                        <h5>Follow Us</h5>
                        <p>Connect with us on social media.</p>
                        <a href="#">LinkedIn</a> | <a href="#">Twitter</a> | <a href="#">Facebook</a>
                    </div>
                </div>
                <p className="text-end mb-0">&copy; NewWave 2024</p>
            </Container>
        </footer>
    );
}

export default SiteFooter;
