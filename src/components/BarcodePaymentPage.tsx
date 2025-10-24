import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService, Product } from '../lib/supabase';
import { useSettings } from '../contexts/SettingsContext';
import { AnimatedBackground } from './AnimatedBackground';
import { QrCode, Phone, Home, AlertTriangle, Camera, MessageSquare, Send } from 'lucide-react';

const BarcodePaymentPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { settings, loading: settingsLoading } = useSettings();

    useEffect(() => {
        if (productId) {
            const fetchProduct = async () => {
                try {
                    setLoading(true);
                    const productData = await productService.getProductById(productId);
                    if (!productData.barcode_image_url) {
                        setError("Barcode payment is not available for this product.");
                    } else {
                        setProduct(productData);
                    }
                } catch (err: any) {
                    setError(err.message || 'Failed to load product details.');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [productId]);

    const getWhatsAppLink = () => {
        if (!product || !settings.whatsapp_url) return '#';

        let phoneNumber = '';
        try {
            const url = new URL(settings.whatsapp_url);
            phoneNumber = url.searchParams.get('phone') || '';
        } catch (e) {
            console.error("Invalid WhatsApp URL in settings:", settings.whatsapp_url);
            return '#';
        }

        if (!phoneNumber) return '#';

        const message = `I would like to purchase ${product.title} for $${product.price}. I have completed the payment and this is my receipt.`;
        return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    };

    if (loading || settingsLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
                <AnimatedBackground />
                <div className="min-h-screen flex items-center justify-center relative z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                        <p className="text-white">Loading Payment Details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
                <AnimatedBackground />
                <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
                    <div className="text-center bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-lg">
                        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">An Error Occurred</h2>
                        <p className="text-red-300 mb-6">{error}</p>
                        <Link to="/" className="inline-flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl transition-colors">
                            <Home className="w-5 h-5" />
                            <span>Back to Home</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return null; // Should be handled by error state
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative text-white">
            <AnimatedBackground />
            <div className="relative z-10 container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            Pay for {product.title}
                        </h1>
                        <p className="text-2xl font-bold text-cyan-300">${product.price}</p>
                    </div>

                    <div className="mb-8">
                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-600 flex justify-center">
                            <img src={product.barcode_image_url!} alt="Payment Barcode" className="rounded-lg max-w-xs w-full" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-3"><Camera className="w-6 h-6 text-cyan-400" /><span>Payment Instructions</span></h2>
                            <ol className="list-decimal list-inside space-y-3 text-gray-300">
                                <li>Open the camera on your mobile phone.</li>
                                <li>Scan the QR code shown above.</li>
                                <li>Open the link that appears on your screen.</li>
                                <li>Complete the payment process.</li>
                                <li>Take a screenshot of the purchase receipt.</li>
                            </ol>
                        </div>

                        <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600">
                             <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-3"><MessageSquare className="w-6 h-6 text-green-400" /><span>Send Receipt</span></h2>
                            <p className="text-gray-300 mb-4">After payment, please send the receipt to us on WhatsApp to receive your product key.</p>
                             <a 
                                href={getWhatsAppLink()}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                            >
                                <Phone className="w-6 h-6" />
                                <span>Contact on WhatsApp & Send Receipt</span>
                                <Send className="w-6 h-6" />
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link to="/" className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center space-x-2">
                            <Home className="w-4 h-4" />
                            <span>Back to All Products</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodePaymentPage;
