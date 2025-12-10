"use client";
import { useState, useEffect } from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { toast } from "@/components/ui/toast";

interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        async function fetchItems() {
            try {
                setLoading(true);
                const res = await fetch("/api/inventory");
                if (!res.ok) {
                    throw new Error("Failed to fetch inventory");
                }
                const data = await res.json();
                setItems(data || []);
            } catch (error) {
                console.error("Failed to fetch inventory:", error);
                toast({ title: "Failed to load inventory", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, []);

    async function handleAdd() {
        if (!name || !quantity) {
            toast({ title: "Please fill all fields", variant: "destructive" });
            return;
        }

        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum < 0) {
            toast({ title: "Please enter a valid quantity", variant: "destructive" });
            return;
        }

        try {
            setAdding(true);
            const res = await fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, quantity: quantityNum }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Failed to add item" }));
                throw new Error(errorData.error || "Failed to add item");
            }

            const data = await res.json();
            toast({ title: "Item added successfully!" });
            setItems([...items, data]);
            setName("");
            setQuantity("");
        } catch (error: any) {
            toast({ title: error.message || "Error adding item", variant: "destructive" });
        } finally {
            setAdding(false);
        }
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={4}>
                Inventory Management
            </Typography>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom mb={2}>
                        Add New Item
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap" alignItems="flex-end">
                        <TextField
                            label="Item Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ flex: 1, minWidth: 200 }}
                        />
                        <TextField
                            label="Quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            sx={{ width: 150 }}
                            inputProps={{ min: 0 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAdd}
                            disabled={adding}
                        >
                            {adding ? "Adding..." : "Add Item"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom mb={2}>
                        Inventory Items
                    </Typography>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : items.length === 0 ? (
                        <Typography color="text.secondary" align="center" py={4}>
                            No inventory items found
                        </Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Name</strong></TableCell>
                                    <TableCell><strong>Quantity</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map(item => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
