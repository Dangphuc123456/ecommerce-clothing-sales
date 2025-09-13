// src/pages/admin/ProductDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Table, Button, Modal, Form, Spinner, Card, Image, Row, Col } from "react-bootstrap";
import api from "../../../api/axios";
import { toast, ToastContainer } from "react-toastify";

interface Product {
  id: number;
  name: string;
  description?: string;
  category_id?: number;
  image?: string;
  created_at?: string;
}

interface Variant {
  id?: number;
  product_id?: number;
  size?: string;
  color?: string;
  price?: number;
  stock?: number;
  sku?: string;
  image?: string; // "/assets/..."
}

interface CategoryOption {
  value: number;
  label: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  const [form, setForm] = useState<Variant>({
    size: "",
    color: "",
    price: 0,
    stock: 0,
    sku: "",
    image: "",
  });

  useEffect(() => {
    if (!productId) return;
    loadCategories();
    loadProduct();
    loadVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const loadProduct = async () => {
    try {
      const res = await api.get(`/api/admin/products/${productId}`);
      // backend có thể trả object hoặc { data: object }
      setProduct(res.data?.data ?? res.data);
    } catch (err: any) {
      toast.error("Failed to load product: " + (err.response?.data?.error ?? err.message));
    }
  };

  const loadVariants = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/products/${productId}/variants`);
      const list: Variant[] = res.data?.data ?? res.data ?? [];
      setVariants(list);
    } catch (err: any) {
      toast.error("Failed to load variants: " + (err.response?.data?.error ?? err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/api/admin/categories");
      const data = Array.isArray(res.data?.data ?? res.data) ? res.data.data ?? res.data : [];
      setCategories(data.map((c: any) => ({ value: c.id, label: c.name })));
    } catch {
      toast.error("Không tải được danh sách categories");
    }
  };

  // Người dùng chọn file: ta chỉ lấy file.name và build path "/assets/<name>"
  // Giả định file đã có sẵn trong public/assets (như bạn yêu cầu)
  const handleSelectVariantImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      const imagePath = `/assets/${fileName}`;
      setForm(prev => ({ ...prev, image: imagePath }));
    }
  };

  // ---------- Add variant ----------
  const openAddVariant = () => {
    setEditingVariant(null);
    setForm({ size: "", color: "", price: 0, stock: 0, sku: "", image: "" });
    setShowAddModal(true);
  };

  const handleCreateVariant = async () => {
    try {
      // include product_id to be safe; backend may also read productId from URL
      await api.post(`/api/admin/products/${productId}/variants`, {
        ...form,
        product_id: productId,
      });
      toast.success("Variant created");
      setShowAddModal(false);
      loadVariants();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? err.message ?? "Create failed");
    }
  };

  // ---------- Edit variant ----------
  const openEditVariant = (v: Variant) => {
    setEditingVariant(v);
    setForm({
      size: v.size ?? "",
      color: v.color ?? "",
      price: v.price ?? 0,
      stock: v.stock ?? 0,
      sku: v.sku ?? "",
      image: v.image ?? "",
    });
    setShowEditModal(true);
  };

  const handleEditVariant = async () => {
    if (!editingVariant || !editingVariant.id) return;
    try {
      await api.put(`/api/admin/products/${productId}/variants/${editingVariant.id}`, {
        ...form,
      });
      toast.success("Variant updated");
      setShowEditModal(false);
      setEditingVariant(null);
      loadVariants();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? err.message ?? "Update failed");
    }
  };

  // ---------- Delete ----------
  const handleDeleteVariant = async (variantId?: number) => {
    if (!variantId) return;
    if (!window.confirm("Are you sure to delete this variant?")) return;
    try {
      await api.delete(`/api/admin/products/${productId}/variants/${variantId}`);
      toast.success("Deleted");
      loadVariants();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? err.message ?? "Delete failed");
    }
  };

  return (
    <div className="p-1">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fs-3">Product Detail</h2>
        <Link to="/admin/products">
          <Button variant="outline-secondary">← Back to List</Button>
        </Link>
      </div>
      <Row className="g-4">
        <Col md={4}>
          <Card className="shadow-sm p-3">
            <Card.Body>
              <h5 className="text-info mb-3">Detailed information</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Product ID</Form.Label>
                  <Form.Control type="text" value={product?.id ?? ""} readOnly />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={product?.name ?? ""} readOnly />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" value={product?.description ?? ""} readOnly rows={3} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={categories.find(c => c.value === product?.category_id)?.label ?? product?.category_id ?? ""}
                    readOnly
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm p-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-info">Product Variants</h5>
                <Button variant="success" onClick={openAddVariant}>+ Add Variant</Button>
              </div>

              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <Table striped bordered hover responsive className="table-sm shadow-sm bg-white rounded">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Size</th>
                      <th>Color</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Image</th>
                      <th>SKU</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted">No variants</td>
                      </tr>
                    ) : (
                      variants.map(v => (
                        <tr key={v.id}>
                          <td>{v.id}</td>
                          <td>{v.size}</td>
                          <td>{v.color}</td>
                          <td>{v.price}</td>
                          <td>{v.stock}</td>
                          <td>{v.image ? <Image src={v.image} width={60} height={60} rounded /> : null}</td>
                          <td>{v.sku}</td>
                          <td className="text-center align-middle">
                            <div className="d-flex justify-content-center gap-2">
                              <Button size="sm" variant="warning" onClick={() => openEditVariant(v)}>Edit</Button>
                              <Button size="sm" variant="danger" onClick={() => handleDeleteVariant(v.id)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Variant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Size</Form.Label>
              <Form.Control value={form.size ?? ""} onChange={e => setForm({ ...form, size: e.target.value })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <Form.Control value={form.color ?? ""} onChange={e => setForm({ ...form, color: e.target.value })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" value={form.price ?? 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" value={form.stock ?? 0} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image (pick a local file name — file must already exist in public/assets)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleSelectVariantImage} />
              {form.image && (
                <div className="mt-2">
                  <Image src={form.image} width={100} rounded />
                </div>
              )}
              <Form.Text className="text-muted">Frontend will send image path like "/assets/filename.png".</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>SKU</Form.Label>
              <Form.Control value={form.sku ?? ""} onChange={e => setForm({ ...form, sku: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreateVariant}>Create</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Variant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Size</Form.Label>
              <Form.Control value={form.size ?? ""} onChange={e => setForm({ ...form, size: e.target.value })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <Form.Control value={form.color ?? ""} onChange={e => setForm({ ...form, color: e.target.value })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" value={form.price ?? 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control type="number" value={form.stock ?? 0} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image </Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleSelectVariantImage} />
              {form.image && (
                <div className="mt-2">
                  <Image src={form.image} width={100} rounded />
                </div>
              )}

            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>SKU</Form.Label>
              <Form.Control value={form.sku ?? ""} onChange={e => setForm({ ...form, sku: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleEditVariant}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
