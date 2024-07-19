import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../Styling/ManageCategory.css'; // Adjust path as needed

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        fetch('http://localhost:5000/api/data')
            .then(response => response.json())
            .then(data => setCategories(data))
            .catch((err) => alert('Error: ' + err.message));
    };

    const handleDelete = () => {
        if (!selectedCategoryName) {
            alert('Please select a category to delete.');
            return;
        }
        fetch(`http://localhost:5000/admin/login/delete_category/${selectedCategoryName}`, {
            method: "DELETE",
            headers:{
                'Content-type':'application/json'
            } 
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Category deleted successfully') {
                alert('Category deleted successfully!');
                // Remove deleted category from state
                setCategories(categories.filter(category => category.title !== selectedCategoryName));
                // Reset selected category
                setSelectedCategoryName('');
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch((err) => alert('Error: ' + err.message));
    };

    return (
        <div className="manage-categories">
            <h3>Manage Categories</h3>

            <div className="category-list">
                <h4>Category List</h4>
                <select
                    className="form-control"
                    value={selectedCategoryName}
                    onChange={(e) => setSelectedCategoryName(e.target.value)}
                >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                        <option key={category._id} value={category._id}>
                            {category.title}
                        </option>
                    ))}
                </select>
                <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    style={{ marginTop: '10px' }}
                >
                    Delete Selected Category
                </button>
            </div>
        </div>
    );
};

export default ManageCategories;
