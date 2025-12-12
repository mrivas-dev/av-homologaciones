import type { Context } from "../deps.ts";
import { z } from "../deps.ts";
import { trailerTypeRepository } from "../repositories/trailerTypeRepository.ts";
import type { AuthContext } from "../types/auth.types.ts";

/**
 * Validation schema for creating a trailer type
 */
const CreateTrailerTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().max(100).optional(),
  price: z.number().int().min(0, "Price must be a positive number"),
  referencePhotos: z.array(
    z.object({
      label: z.string().min(1),
      path: z.string().min(1),
    })
  ).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * Validation schema for updating a trailer type
 */
const UpdateTrailerTypeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().max(100).optional(),
  price: z.number().int().min(0).optional(),
  referencePhotos: z.array(
    z.object({
      label: z.string().min(1),
      path: z.string().min(1),
    })
  ).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export class TrailerTypeController {
  /**
   * GET /api/trailer-types
   * List active trailer types (public - for forms)
   */
  async listActive(ctx: Context) {
    try {
      const trailerTypes = await trailerTypeRepository.findActive();

      ctx.response.status = 200;
      ctx.response.body = {
        data: trailerTypes,
        total: trailerTypes.length,
      };
    } catch (error) {
      console.error("List active trailer types error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }

  /**
   * GET /api/admin/trailer-types
   * List all trailer types (admin - includes inactive)
   */
  async listAll(ctx: Context) {
    try {
      const trailerTypes = await trailerTypeRepository.findAll();

      ctx.response.status = 200;
      ctx.response.body = {
        data: trailerTypes,
        total: trailerTypes.length,
      };
    } catch (error) {
      console.error("List all trailer types error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }

  /**
   * GET /api/admin/trailer-types/:id
   * Get a single trailer type by ID (admin)
   */
  async getById(ctx: Context) {
    try {
      const id = ctx.params.id;

      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Trailer type ID is required" };
        return;
      }

      const trailerType = await trailerTypeRepository.findById(id);

      if (!trailerType) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Trailer type not found" };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = trailerType;
    } catch (error) {
      console.error("Get trailer type by ID error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }

  /**
   * POST /api/admin/trailer-types
   * Create a new trailer type (admin)
   */
  async create(ctx: Context) {
    try {
      const body = await ctx.request.body.json();
      const validationResult = CreateTrailerTypeSchema.safeParse(body);

      if (!validationResult.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          error: "Invalid request",
          details: validationResult.error.errors,
        };
        return;
      }

      const data = validationResult.data;

      // Check if name already exists
      const existsByName = await trailerTypeRepository.existsByName(data.name);
      if (existsByName) {
        ctx.response.status = 409;
        ctx.response.body = { error: "A trailer type with this name already exists" };
        return;
      }

      // Check if slug already exists (if provided)
      if (data.slug) {
        const existsBySlug = await trailerTypeRepository.existsBySlug(data.slug);
        if (existsBySlug) {
          ctx.response.status = 409;
          ctx.response.body = { error: "A trailer type with this slug already exists" };
          return;
        }
      }

      const auth = ctx.state.auth as AuthContext;
      const trailerType = await trailerTypeRepository.create(data, auth.user.id);

      ctx.response.status = 201;
      ctx.response.body = trailerType;
    } catch (error) {
      console.error("Create trailer type error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }

  /**
   * PATCH /api/admin/trailer-types/:id
   * Update a trailer type (admin)
   */
  async update(ctx: Context) {
    try {
      const id = ctx.params.id;

      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Trailer type ID is required" };
        return;
      }

      const body = await ctx.request.body.json();
      const validationResult = UpdateTrailerTypeSchema.safeParse(body);

      if (!validationResult.success) {
        ctx.response.status = 400;
        ctx.response.body = {
          error: "Invalid request",
          details: validationResult.error.errors,
        };
        return;
      }

      const data = validationResult.data;

      // Check if trailer type exists
      const existing = await trailerTypeRepository.findById(id);
      if (!existing) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Trailer type not found" };
        return;
      }

      // Check if name already exists (if changing name)
      if (data.name && data.name !== existing.name) {
        const existsByName = await trailerTypeRepository.existsByName(data.name, id);
        if (existsByName) {
          ctx.response.status = 409;
          ctx.response.body = { error: "A trailer type with this name already exists" };
          return;
        }
      }

      // Check if slug already exists (if changing slug)
      if (data.slug && data.slug !== existing.slug) {
        const existsBySlug = await trailerTypeRepository.existsBySlug(data.slug, id);
        if (existsBySlug) {
          ctx.response.status = 409;
          ctx.response.body = { error: "A trailer type with this slug already exists" };
          return;
        }
      }

      const auth = ctx.state.auth as AuthContext;
      const trailerType = await trailerTypeRepository.update(id, data, auth.user.id);

      ctx.response.status = 200;
      ctx.response.body = trailerType;
    } catch (error) {
      console.error("Update trailer type error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }

  /**
   * DELETE /api/admin/trailer-types/:id
   * Delete a trailer type (admin)
   */
  async delete(ctx: Context) {
    try {
      const id = ctx.params.id;

      if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Trailer type ID is required" };
        return;
      }

      // Check if trailer type exists
      const existing = await trailerTypeRepository.findById(id);
      if (!existing) {
        ctx.response.status = 404;
        ctx.response.body = { error: "Trailer type not found" };
        return;
      }

      const deleted = await trailerTypeRepository.delete(id);

      if (!deleted) {
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to delete trailer type" };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = { message: "Trailer type deleted successfully" };
    } catch (error) {
      console.error("Delete trailer type error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal server error" };
    }
  }
}

