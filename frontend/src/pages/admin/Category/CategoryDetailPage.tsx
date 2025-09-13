// src/pages/admin/CategoryDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Table, Button, Modal, Form, Spinner, Row, Col, Card, Image, Pagination } from "react-bootstrap";
import api from "../../../api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Product {
  id?: number;
  name: string;
  description?: string;
  category_id?: number;
  image?: string;
  created_at?: string;
}

interface Category {
  id: number;
  name: string;
  CreatedAt?: string;
  Products?: Product[];
}

const PAGE_SIZE = 5;

const CategoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Product>({
    name: "",
    description: "",
    category_id: categoryId,
    image: "",
  });

  useEffect(() => {
    if (!categoryId) return;
    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/categories/${categoryId}`);
      const cat: Category = res.data?.data ?? res.data;
      setCategory(cat);
      setProducts(cat.Products ?? []);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? err.message ?? "Failed to load category");
    } finally {
      setLoading(false);
    }
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", description: "", category_id: categoryId, image: "" });
    setShowProductModal(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({ ...product });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct && editingProduct.id) {
        await api.put(`/api/admin/products/${editingProduct.id}`, productForm);
        toast.success("Product updated");
      } else {
        await api.post("/api/admin/products", productForm);
        toast.success("Product created");
      }
      setShowProductModal(false);
      loadCategory();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? err.message ?? "Save failed");
    }
  };

  const handleDeleteProduct = async (productId?: number) => {
    if (!productId) return;
    if (!confirm("Are you sure to delete this product?")) return;
    try {
      await api.delete(`/api/admin/products/${productId}`);
      toast.success("Product deleted");
      loadCategory();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? err.message ?? "Delete failed");
    }
  };

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginatedProducts = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Row className="p-4">
      <ToastContainer />
      {/* Category Info */}
      <Col md={12} className="mb-4">
        <Card className="shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="text-primary fs-3">Category Detail</h2>
              <Link to="/admin/categories">
                <Button variant="outline-secondary">← Back to List</Button>
              </Link>
            </div>
            <Form>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Label>ID</Form.Label>
                  <Form.Control readOnly value={category?.id || ""} />
                </Col>
                <Col md={4}>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={category?.name || ""}
                    onChange={e => setCategory(prev => prev ? { ...prev, name: e.target.value } : prev)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>Created At</Form.Label>
                  <Form.Control readOnly value={category?.CreatedAt ? new Date(category.CreatedAt).toLocaleString() : ""} />
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Col>

      {/* Products List */}
      <Col md={12}>
        <Card className="shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-info mb-0">Products</h5>
              <Button variant="success" onClick={openAddProduct}>+ Add Product</Button>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>
            ) : (
              <>
                <Table striped bordered hover responsive className="table-sm">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Image</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted">No products</td>
                      </tr>
                    ) : (
                      paginatedProducts.map(p => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td><Link to={`/admin/products/${p.id}`}>{p.name}</Link></td>
                          <td>{p.description ?? "-"}</td>
                          <td>{p.image && <Image src={p.image} width={60} height={60} />}</td>
                          <td>{p.created_at ? new Date(p.created_at).toLocaleString() : "-"}</td>
                          <td className="text-center align-middle">
                            <div className="d-flex justify-content-center gap-2">
                              <Button size="sm" variant="warning" onClick={() => openEditProduct(p)}>Edit</Button>
                              <Button size="sm" variant="danger" onClick={() => handleDeleteProduct(p.id)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="justify-content-center">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Product Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={productForm.name ?? ""}
                onChange={e => setProductForm({ ...productForm, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={productForm.description ?? ""}
                onChange={e => setProductForm({ ...productForm, description: e.target.value })}
              />
            </Form.Group>

            {/* Image input */}
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={e => {
                  const target = e.target as HTMLInputElement; // ép kiểu
                  if (target.files && target.files.length > 0) {
                    const file = target.files[0];
                    const imagePath = `/assets/${file.name}`;
                    setProductForm({ ...productForm, image: imagePath });
                  }
                }} />
              {productForm.image && (
                <div className="mt-2">
                  <Image src={productForm.image} width={100} />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveProduct}>{editingProduct ? "Save" : "Create"}</Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default CategoryDetailPage;
